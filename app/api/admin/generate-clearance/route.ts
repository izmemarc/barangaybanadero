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
  residency: process.env.RESIDENCY_TEMPLATE_ID!,
  luntian: process.env.LUNTIAN_TEMPLATE_ID!,
  'cso-accreditation': process.env.CSO_ACCREDITATION_TEMPLATE_ID!,
  'barangay-id': process.env.BARANGAY_ID_TEMPLATE_ID!
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
        Business: submission.form_data.businessName || submission.form_data.business || '',
        Address: submission.form_data.businessAddress || submission.form_data.address || '',
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
        time: submissionTime,
        name: submission.name || '',
        address: submission.form_data.address || resident?.purok || '',
        contact_no: submission.form_data.contact || '',
        age: submission.form_data.age || resident?.age?.toString() || '',
        civil_status: submission.form_data.civilStatus ? toSentenceCase(submission.form_data.civilStatus) : (resident?.civil_status ? toSentenceCase(resident.civil_status) : ''),
        name2: submission.form_data.respondentName || '',
        address2: submission.form_data.respondentAddress || '',
        age2: submission.form_data.respondentAge || '',
        civil_status2: submission.form_data.respondentCivil ? toSentenceCase(submission.form_data.respondentCivil) : '',
        incident: submission.form_data.incidentType || submission.form_data.incident || '',
        incident_description: submission.form_data.incidentDescription || '',
        incident_date: submission.form_data.incidentDate || '',
        incident_place: submission.form_data.incidentLocation || submission.form_data.incidentPlace || '',
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
        usedate: submission.form_data.eventDate || submission.form_data.date || '',
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
    // LUNTIAN - Uses <placeholder> format
    else if (clearanceType === 'luntian') {
      // Date of request is when the form was submitted (created_at)
      const requestDate = submission.created_at
        ? new Date(submission.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : dateIssued
      
      // Format requested items as bullet list
      let requestedItemsList = ''
      const requestedItems = submission.form_data.requestedItems || ''
      if (requestedItems) {
        const items = requestedItems.split(',').map((item: string) => item.trim()).filter((item: string) => item)
        
        // Get additional details
        const vegetableSeeds = submission.form_data.vegetableSeeds || ''
        const vegetableSeedsDetails = submission.form_data.vegetableSeedsDetails || ''
        const requestedItemsDetails = submission.form_data.requestedItemsDetails || ''
        
        // Separate "Others" items from regular items
        const regularItems: string[] = []
        const othersItems: string[] = []
        
        items.forEach((item: string) => {
          // Handle "Others" items separately to move them to the end
          if (item.toLowerCase() === 'others' && requestedItemsDetails) {
            othersItems.push(requestedItemsDetails)
          } else if (item.toLowerCase() !== 'others') {
            // Add vegetable seeds details if available
            if (item.toLowerCase().includes('vegetable') && item.toLowerCase().includes('seed') && vegetableSeeds) {
              // Replace "Others" in vegetableSeeds with the actual details
              let seedsList = vegetableSeeds
              if (vegetableSeeds.includes('Others') && vegetableSeedsDetails) {
                seedsList = vegetableSeeds.replace(/Others/gi, vegetableSeedsDetails)
              }
              regularItems.push(`${item} (${seedsList})`)
            } else {
              regularItems.push(item)
            }
          }
        })
        
        // Combine regular items first, then others items
        const allItems = [...regularItems, ...othersItems]
        requestedItemsList = allItems.map((item: string) => `• ${item}`).join('\n')
      }
      
      // Format released items with empty checkboxes (□)
      let releasedItemsList = ''
      if (requestedItems) {
        const items = requestedItems.split(',').map((item: string) => item.trim()).filter((item: string) => item)
        
        // Get additional details
        const vegetableSeeds = submission.form_data.vegetableSeeds || ''
        const vegetableSeedsDetails = submission.form_data.vegetableSeedsDetails || ''
        const requestedItemsDetails = submission.form_data.requestedItemsDetails || ''
        
        // Separate "Others" items from regular items
        const regularItems: string[] = []
        const othersItems: string[] = []
        
        items.forEach((item: string) => {
          // Handle "Others" items separately to move them to the end
          if (item.toLowerCase() === 'others' && requestedItemsDetails) {
            othersItems.push(requestedItemsDetails)
          } else if (item.toLowerCase() !== 'others') {
            // Add vegetable seeds details if available
            if (item.toLowerCase().includes('vegetable') && item.toLowerCase().includes('seed') && vegetableSeeds) {
              // Replace "Others" in vegetableSeeds with the actual details
              let seedsList = vegetableSeeds
              if (vegetableSeeds.includes('Others') && vegetableSeedsDetails) {
                seedsList = vegetableSeeds.replace(/Others/gi, vegetableSeedsDetails)
              }
              regularItems.push(`${item} (${seedsList})`)
            } else {
              regularItems.push(item)
            }
          }
        })
        
        // Combine regular items first, then others items
        const allItems = [...regularItems, ...othersItems]
        releasedItemsList = allItems.map((item: string) => `□ ${item}`).join('\n')
      }
      
      replacements = {
        date: requestDate,
        dateprinted: dateIssued, // Date when document is generated
        name: submission.name || '',
        items: requestedItemsList,
        releaseditems: releasedItemsList,
        purpose: submission.form_data.purposeOfRequest || ''
      }
    }
    // CSO/NGO ACCREDITATION - Uses <placeholder> format
    else if (clearanceType === 'cso-accreditation') {
      const regDate = submission.form_data.registrationDate 
        ? new Date(submission.form_data.registrationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : ''
      
      // Calculate bullet points for section VII
      const advocacyItems = submission.form_data.advocacy ? submission.form_data.advocacy.split(', ') : []
      const advocacyBullets = advocacyItems.map((item: string) => `• ${item.trim()}`).join('\n')
      const advocacyLines = advocacyItems.length
      
      // Calculate bullet points for section VIII
      const specialBodyItems = submission.form_data.specialBody ? submission.form_data.specialBody.split(', ') : []
      const specialBodyBullets = specialBodyItems.map((item: string) => `• ${item.trim()}`).join('\n')
      const specialBodyLines = specialBodyItems.length
      
      // Total lines used by both sections
      const totalUsedLines = advocacyLines + specialBodyLines
      
      // Calculate how many blank lines to add to reach 16 total
      const blankLinesToAdd = Math.max(0, 16 - totalUsedLines)
      
      // Add all blank lines after section VIII
      const viiContent = advocacyBullets
      const viiiContent = specialBodyBullets + '\n'.repeat(blankLinesToAdd)
      
      replacements = {
        name: submission.form_data.orgName || '',
        acronym: submission.form_data.orgAcronym || '',
        type: submission.form_data.orgType || '',
        nature: submission.form_data.orgNature || '',
        agency: submission.form_data.registeringAgency || '',
        regnumber: submission.form_data.registrationNo || '',
        regdate: regDate,
        address: submission.form_data.officeAddress || '',
        number: submission.form_data.contact || '',
        email: submission.form_data.email || '',
        pres: submission.form_data.president || '',
        tpres: submission.form_data.presidentTenure || '',
        vice: submission.form_data.vicePresident || '',
        tvice: submission.form_data.vicePresidentTenure || '',
        sec: submission.form_data.secretary || '',
        tsec: submission.form_data.secretaryTenure || '',
        tres: submission.form_data.treasurer || '',
        ttres: submission.form_data.treasurerTenure || '',
        aud: submission.form_data.auditor || '',
        taud: submission.form_data.auditorTenure || '',
        members: submission.form_data.totalMembers?.toString() || '',
        residing: submission.form_data.barangayMembers?.toString() || '',
        vii: viiContent,
        viii: viiiContent,
        ix: '' // Documentary requirements - to be filled manually
      }
    }
    // BARANGAY ID - Uses <placeholder> format based on the ID card image
    // Get data from resident database if available, otherwise from form data
    else if (clearanceType === 'barangay-id') {
      // Format birthday from resident data
      let formattedBirthday = ''
      if (resident?.birthdate) {
        const birthDate = new Date(resident.birthdate)
        formattedBirthday = birthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      }
      
      replacements = {
        name: submission.name.toUpperCase(),
        contactno: submission.form_data.contact_no || '',
        contactnumber: submission.form_data.contact_no || '',
        purok: resident?.purok || submission.form_data.purok || '',
        birthday: formattedBirthday || submission.form_data.birthday || '',
        sex: resident?.gender || submission.form_data.sex || '',
        citizenship: resident?.citizenship || submission.form_data.citizenship || '',
        blood: submission.form_data.blood_type || '',
        bloodtype: submission.form_data.blood_type || '',
        sss: submission.form_data.sss_no || '',
        tin: submission.form_data.tin_no || '',
        passport: submission.form_data.passport_no || '',
        pasport: submission.form_data.passport_no || '',
        other: submission.form_data.other_id_no || '',
        precinct: submission.form_data.precinct_no || '',
        occupation: submission.form_data.occupation || '',
        contactperson: submission.form_data.contact_person || '',
        cpnumber: submission.form_data.cp_number || submission.form_data.cpnumber || '',
        validity: submission.form_data.id_validity || '',
        age: resident?.age?.toString() || submission.form_data.age || ''
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
      // Use smaller size (1.4cm = 39.685 PT) for barangay ID, default size (90 PT) for others
      const photoSize = clearanceType === 'barangay-id' ? 39.685 : 90
      await insertPhotoIntoDocument(
        documentId,
        nameParts.lastName,
        nameParts.firstName,
        nameParts.middleName,
        nameParts.suffix,
        supabase,
        '<picture>',
        photoSize
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
      
      // For barangay ID, bold the name
      if (clearanceType === 'barangay-id') {
        await boldTextInDocument(documentId, submission.name.toUpperCase(), auth)
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
      
      // For barangay ID, bold the name
      if (clearanceType === 'barangay-id') {
        const auth = getAuthClient()
        await boldTextInDocument(documentId, submission.name.toUpperCase(), auth)
      }
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

async function boldTextInDocument(documentId: string, textToBold: string, auth: any): Promise<void> {
  try {
    const docs = google.docs({ version: 'v1', auth })
    
    // Get the document to find the text
    const doc = await docs.documents.get({ documentId })
    const content = doc.data.body?.content || []
    
    // Find all occurrences of the text
    const ranges: Array<{ startIndex: number; endIndex: number }> = []
    
    const searchInElements = (elements: any[]) => {
      for (const element of elements) {
        if (element.paragraph) {
          for (const textElement of element.paragraph.elements || []) {
            const text = textElement.textRun?.content || ''
            if (text.includes(textToBold)) {
              const startIndex = textElement.startIndex!
              const textStart = text.indexOf(textToBold)
              const actualStart = startIndex + textStart
              const actualEnd = actualStart + textToBold.length
              ranges.push({ startIndex: actualStart, endIndex: actualEnd })
            }
          }
        }
        // Search in table cells
        if (element.table) {
          for (const row of element.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              searchInElements(cell.content || [])
            }
          }
        }
      }
    }
    
    searchInElements(content)
    
    if (ranges.length === 0) {
      console.log(`[Bold] Text "${textToBold}" not found in document`)
      return
    }
    
    // Apply bold formatting to all found ranges
    const requests = ranges.map(range => ({
      updateTextStyle: {
        range: {
          startIndex: range.startIndex,
          endIndex: range.endIndex
        },
        textStyle: {
          bold: true
        },
        fields: 'bold'
      }
    }))
    
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests }
    })
    
    console.log(`[Bold] Successfully bolded "${textToBold}" in ${ranges.length} location(s)`)
  } catch (error) {
    console.error('[Bold] Error bolding text:', error)
    // Don't throw - formatting is optional
  }
}
