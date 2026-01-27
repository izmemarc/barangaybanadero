import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateClearanceDocument, insertPhotoIntoDocument } from '@/lib/google-docs'
import { google } from 'googleapis'
import { notifyDocumentGenerated } from '@/lib/philsms'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Template IDs and folder IDs
const TEMPLATES = {
  barangay: process.env.BARANGAY_TEMPLATE_ID!,
  business: process.env.BUSINESS_TEMPLATE_ID!,
  blotter: process.env.BLOTTER_TEMPLATE_ID!,
  facility: process.env.FACILITY_TEMPLATE_ID!,
  'good-moral': process.env.GOOD_MORAL_TEMPLATE_ID!,
  indigency: process.env.INDIGENCY_TEMPLATE_ID!,
  residency: process.env.RESIDENCY_TEMPLATE_ID!
}

const OUTPUT_FOLDER_ID = process.env.GOOGLE_DRIVE_OUTPUT_FOLDER_ID!

// Helper to get auth client (copied from google-docs.ts)
function getAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || ''
  
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3001/api/oauth/callback'
  )

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })

  return oauth2Client
}

// Helper to parse full name into parts
function parseFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 2) {
    return { firstName: parts[0], middleName: '', lastName: parts[1], suffix: '' }
  } else if (parts.length === 3) {
    return { firstName: parts[0], middleName: parts[1], lastName: parts[2], suffix: '' }
  } else if (parts.length >= 4) {
    const lastPart = parts[parts.length - 1]
    const suffixes = ['JR', 'SR', 'II', 'III', 'IV', 'V']
    
    if (suffixes.includes(lastPart.toUpperCase().replace('.', ''))) {
      return { 
        firstName: parts[0], 
        middleName: parts[1], 
        lastName: parts.slice(2, -1).join(' '), 
        suffix: lastPart 
      }
    }
    
    return { 
      firstName: parts[0], 
      middleName: parts[1], 
      lastName: parts.slice(2).join(' '), 
      suffix: '' 
    }
  }
  
  return { firstName: fullName, middleName: '', lastName: '', suffix: '' }
}

export async function POST(request: NextRequest) {
  try {
    const { submissionId, processedBy } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing submissionId' }, { status: 400 })
    }

    // Get submission from database
    const { data: submission, error: fetchError } = await supabase
      .from('clearance_submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Get resident data using resident_id from submission
    let resident = null
    let nameParts = { firstName: '', middleName: '', lastName: '', suffix: '' }
    
    if (submission.resident_id) {
      const { data: residentData } = await supabase
        .from('residents')
        .select('*')
        .eq('id', submission.resident_id)
        .single()
      
      resident = residentData
      
      if (resident) {
        // Use exact data from residents table
        nameParts = {
          firstName: resident.first_name || '',
          middleName: resident.middle_name || '',
          lastName: resident.last_name || '',
          suffix: resident.suffix || ''
        }
      }
    }
    
    // Fallback: parse name if no resident_id
    if (!resident) {
      nameParts = parseFullName(submission.name)
    }

    // Current date info
    const today = new Date()
    const dateIssued = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const month = today.toLocaleDateString('en-US', { month: 'long' })
    const dayNum = today.getDate()
    const year = today.getFullYear().toString()
    const dayOrd = getOrdinal(dayNum)

    // Build replacements based on clearance type
    let replacements: Record<string, string> = {}

    const clearanceType = submission.clearance_type

    // BARANGAY CLEARANCE - Update template to use <placeholder> format
    if (clearanceType === 'barangay') {
      replacements = {
        LastName: nameParts.lastName.toUpperCase(),
        FirstName: nameParts.firstName.toUpperCase(),
        MiddleName: nameParts.middleName.toUpperCase(),
        Suffix: nameParts.suffix.toUpperCase(),
        Purpose: submission.form_data.purpose || '',
        DateIssued: dateIssued,
        Sex: resident?.gender || '',
        MaritalStatus: resident?.civil_status ? toSentenceCase(resident.civil_status) : '',
        Citizenship: resident?.citizenship || '',
        Address: resident?.purok || '',
        Age: resident?.age?.toString() || '',
        Birthdate: resident?.birthdate ? new Date(resident.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
      }
    }
    // BUSINESS CLEARANCE - Update template to use <placeholder> format
    else if (clearanceType === 'business') {
      replacements = {
        FirstName: nameParts.firstName.toUpperCase(),
        MiddleName: nameParts.middleName.toUpperCase(),
        LastName: nameParts.lastName.toUpperCase(),
        Suffix: nameParts.suffix.toUpperCase(),
        Occupation: submission.form_data.occupation || '',
        Contact: submission.form_data.contact || '',
        Business: submission.form_data.business || '',
        Address: submission.form_data.address || '',
        Purok: resident?.purok || '',
        Nationality: resident?.citizenship || '',
        Civil: resident?.civil_status ? toSentenceCase(resident.civil_status) : '',
        DateIssued: dateIssued
      }
    }
    // BLOTTER - Uses <placeholder> format
    else if (clearanceType === 'blotter') {
      const submissionTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      replacements = {
        date: dateIssued,
        time: submissionTime, // Note: <time> placeholder not in template, but keeping for backward compatibility
        name: submission.form_data.complainantName || '',
        address: submission.form_data.complainantAddress || '',
        contact_no: submission.form_data.complainantContact || '',
        age: submission.form_data.complainantAge || '',
        civil_status: submission.form_data.complainantCivil ? toSentenceCase(submission.form_data.complainantCivil) : '',
        name2: submission.form_data.respondentName || '',
        address2: submission.form_data.respondentAddress || '',
        age2: submission.form_data.respondentAge || '',
        civil_status2: submission.form_data.respondentCivil ? toSentenceCase(submission.form_data.respondentCivil) : '',
        incident: submission.form_data.incident || '',
        incident_description: submission.form_data.incidentDescription || '',
        incident_date: submission.form_data.incidentDate || '',
        incident_place: submission.form_data.incidentPlace || '',
        incident_time: submission.form_data.incidentTime || ''
      }
    }
    // FACILITY - Uses <placeholder> format
    else if (clearanceType === 'facility') {
      const submissionTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      replacements = {
        or: '', // Template has <or> but we're leaving it blank
        date: dateIssued,
        time: submissionTime,
        month: month,
        day: dayNum.toString(),
        year: year,
        name: submission.name.toUpperCase(),
        address: resident?.purok || submission.form_data.address || '',
        contact_no: submission.form_data.contact || '',
        civil_status: resident?.civil_status ? toSentenceCase(resident.civil_status) : '',
        age: resident?.age?.toString() || '',
        facility: submission.form_data.facility || '',
        purpose: submission.form_data.purpose || '',
        usedate: submission.form_data.date || '',
        start: submission.form_data.startTime || '',
        end: submission.form_data.endTime || '',
        number: submission.form_data.participants || '',
        equipment: submission.form_data.equipment || '',
        amount: submission.form_data.amount || ''
      }
    }
    // GOOD MORAL - Uses <placeholder> format (case-sensitive: <first>, <Middle>, <Last>)
    else if (clearanceType === 'good-moral') {
      replacements = {
        first: nameParts.firstName.toUpperCase(),
        Middle: nameParts.middleName.toUpperCase(),
        Last: nameParts.lastName.toUpperCase(),
        civil: resident?.civil_status || '',
        address: resident?.purok || '',
        day: dayOrd,
        month: month,
        year: year,
        pay_month: month,
        pay_day: dayNum.toString().padStart(2, '0'),
        pay_year: year
      }
    }
    // INDIGENCY - Uses <placeholder> format (exact case: <first>, <Middle>, <Last>, <Purok>)
    else if (clearanceType === 'indigency') {
      replacements = {
        first: nameParts.firstName.toUpperCase(),
        Middle: nameParts.middleName.toUpperCase(),
        Last: nameParts.lastName.toUpperCase(),
        age: resident?.age?.toString() || '',
        civil: resident?.civil_status || '',
        Purok: resident?.purok || '',
        day: dayOrd,
        month: month,
        year: year,
        purpose: submission.form_data.purpose || ''
      }
    }
    // RESIDENCY - Uses <placeholder> format (exact case: <first>, <Middle>, <Last>)
    else if (clearanceType === 'residency') {
      const yearResided = submission.form_data.yearResided || ''
      let startText = yearResided
      
      // If it's just a year number
      if (/^\d{4}$/.test(yearResided)) {
        startText = yearResided
      }

      replacements = {
        first: nameParts.firstName.toUpperCase(),
        Middle: nameParts.middleName.toUpperCase(),
        Last: nameParts.lastName.toUpperCase(),
        civil: resident?.civil_status || '',
        address: resident?.purok || '',
        start: startText,
        day: dayOrd,
        month: month,
        year: year,
        issued_month: month,
        issued_day: dayNum.toString(),
        issued_year: year
      }
    }

    // Generate document
    const templateId = TEMPLATES[submission.clearance_type as keyof typeof TEMPLATES]
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template not configured for this clearance type' }, { status: 500 })
    }

    const fileName = `${submission.name} - ${submission.clearance_type.replace('-', ' ')} Clearance`

    // Insert photo BEFORE text replacements (so {{picture}} placeholder exists)
    let documentId: string
    let documentUrl: string
    
    if (resident && nameParts.lastName && nameParts.firstName) {
      // Generate document first
      const result = await generateClearanceDocument(
        templateId,
        OUTPUT_FOLDER_ID,
        {},  // No replacements yet
        fileName
      )
      documentId = result.documentId
      documentUrl = result.documentUrl
      
      // Insert photo while placeholder still exists
      await insertPhotoIntoDocument(
        documentId,
        nameParts.lastName,
        nameParts.firstName,
        nameParts.middleName,
        nameParts.suffix,
        supabase
      )
      
      // Now apply text replacements
      const auth = getAuthClient()
      const docs = google.docs({ version: 'v1', auth })
      const requests = Object.entries(replacements).map(([placeholder, value]) => ({
        replaceAllText: {
          containsText: {
            text: `<${placeholder}>`,
            matchCase: true
          },
          replaceText: value || ''
        }
      }))
      
      if (requests.length > 0) {
        await docs.documents.batchUpdate({
          documentId,
          requestBody: { requests }
        })
      }
    } else {
      // No photo, just do text replacements
      const result = await generateClearanceDocument(
        templateId,
        OUTPUT_FOLDER_ID,
        replacements,
        fileName
      )
      documentId = result.documentId
      documentUrl = result.documentUrl
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from('clearance_submissions')
      .update({
        status: 'approved',
        document_url: documentUrl,
        processed_by: processedBy || 'admin',
        processed_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    if (updateError) {
      throw updateError
    }

    // Send SMS notification to contact if available
    const contactNumber = submission.form_data.contact || submission.form_data.contactNumber || submission.form_data.contact_no
    if (contactNumber) {
      try {
        console.log('[SMS] Attempting to send document notification...')
        const smsResult = await notifyDocumentGenerated(contactNumber, submission.name, submission.clearance_type)
        if (smsResult?.success) {
          console.log('[SMS] Document notification sent successfully to:', contactNumber)
        } else {
          console.error('[SMS] Failed to send document notification:', smsResult?.error)
        }
      } catch (smsError) {
        console.error('[SMS] Exception sending document notification:', smsError)
        // Don't fail the request if SMS fails
      }
    } else {
      console.log('[SMS] No contact number found in submission, skipping SMS notification')
    }

    return NextResponse.json({ 
      success: true, 
      documentUrl 
    })

  } catch (error) {
    console.error('=== ERROR GENERATING CLEARANCE ===')
    console.error('Error:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('===================================')
    return NextResponse.json(
      { error: 'Failed to generate document', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper functions
function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function toSentenceCase(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function calculateAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}
