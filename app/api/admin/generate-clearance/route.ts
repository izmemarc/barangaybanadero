import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateClearanceDocument } from '@/lib/google-docs'

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

    // Parse name from submission
    const nameParts = parseFullName(submission.name)

    // Try to find resident in database for additional data
    const { data: resident } = await supabase
      .from('residents')
      .select('*')
      .ilike('first_name', `%${nameParts.firstName}%`)
      .ilike('last_name', `%${nameParts.lastName}%`)
      .limit(1)
      .maybeSingle()

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

    // BARANGAY CLEARANCE
    if (clearanceType === 'barangay') {
      replacements = {
        LastName: nameParts.lastName.toUpperCase(),
        FirstName: nameParts.firstName.toUpperCase(),
        MiddleName: nameParts.middleName.toUpperCase(),
        Suffix: nameParts.suffix.toUpperCase(),
        Purpose: submission.form_data.purpose || '',
        DateIssued: dateIssued,
        ClearanceNumber: '', // removed
        Sex: resident?.gender || '',
        MaritalStatus: resident?.civil_status ? toSentenceCase(resident.civil_status) : '',
        Citizenship: resident?.citizenship || '',
        Address: resident?.purok || '',
        Age: resident?.age?.toString() || '',
        Birthdate: resident?.birthdate ? new Date(resident.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
      }
    }
    // BUSINESS CLEARANCE
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
        DateIssued: dateIssued,
        ClearanceNumber: '' // removed
      }
    }
    // BLOTTER
    else if (clearanceType === 'blotter') {
      const submissionTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      replacements = {
        date: dateIssued,
        time: submissionTime,
        name: submission.form_data.complainantName || '',
        address: submission.form_data.complainantAddress || '',
        contact_no: submission.form_data.complainantContact || '',
        age: submission.form_data.complainantAge || '',
        civil_status: submission.form_data.complainantCivil ? toSentenceCase(submission.form_data.complainantCivil) : '',
        name2: submission.form_data.respondentName || '',
        address2: '', // would need respondent lookup
        age2: '',
        civil_status2: '',
        incident: submission.form_data.incident || '',
        incident_description: submission.form_data.incidentDescription || '',
        incident_date: submission.form_data.incidentDate || '',
        incident_place: submission.form_data.incidentPlace || '',
        incident_time: submission.form_data.incidentTime || '',
        or: '' // removed
      }
    }
    // FACILITY
    else if (clearanceType === 'facility') {
      const submissionTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      replacements = {
        or: '', // removed
        date: dateIssued,
        time: submissionTime,
        month: month,
        day: dayNum.toString(),
        year: year,
        name: submission.name.toUpperCase(),
        address: '',
        contact_no: submission.form_data.contact || '',
        civil_status: '',
        age: '',
        facility: submission.form_data.facility || '',
        purpose: submission.form_data.purpose || '',
        usedate: submission.form_data.date || '',
        start: submission.form_data.startTime || '',
        end: submission.form_data.endTime || '',
        number: submission.form_data.participants || '',
        equipment: submission.form_data.equipment || '',
        amount: '' // could calculate
      }
    }
    // GOOD MORAL
    else if (clearanceType === 'good-moral') {
      replacements = {
        first: nameParts.firstName.toUpperCase(),
        First: nameParts.firstName.toUpperCase(),
        middle: nameParts.middleName.toUpperCase(),
        Middle: nameParts.middleName.toUpperCase(),
        last: nameParts.lastName.toUpperCase(),
        Last: nameParts.lastName.toUpperCase(),
        civil: resident?.civil_status || '',
        Civil: resident?.civil_status || '',
        address: resident?.purok || '',
        Address: resident?.purok || '',
        day: dayOrd,
        Day: dayOrd,
        month: month,
        Month: month,
        year: year,
        Year: year,
        pay_month: month,
        PAY_MONTH: month,
        pay_day: dayNum.toString().padStart(2, '0'),
        PAY_DAY: dayNum.toString().padStart(2, '0'),
        pay_year: year,
        PAY_YEAR: year,
        or: '', // removed
        OR: '',
        certno: '',
        CertNo: ''
      }
    }
    // INDIGENCY
    else if (clearanceType === 'indigency') {
      replacements = {
        first: nameParts.firstName.toUpperCase(),
        First: nameParts.firstName.toUpperCase(),
        middle: nameParts.middleName.toUpperCase(),
        Middle: nameParts.middleName.toUpperCase(),
        last: nameParts.lastName.toUpperCase(),
        Last: nameParts.lastName.toUpperCase(),
        age: resident?.age?.toString() || '',
        Age: resident?.age?.toString() || '',
        civil: resident?.civil_status || '',
        Civil: resident?.civil_status || '',
        purok: resident?.purok || '',
        Purok: resident?.purok || '',
        day: dayOrd,
        Day: dayOrd,
        month: month,
        Month: month,
        year: year,
        Year: year,
        contact_no: submission.form_data.contact || '',
        Contact_No: submission.form_data.contact || '',
        purpose: submission.form_data.purpose || '',
        Purpose: submission.form_data.purpose || '',
        ClearanceNumber: '', // removed
        or: '',
        OR: '',
        certno: '',
        Certno: '',
        CertNo: ''
      }
    }
    // RESIDENCY
    else if (clearanceType === 'residency') {
      const yearResided = submission.form_data.yearResided || ''
      let startText = yearResided
      
      // If it's just a year number
      if (/^\d{4}$/.test(yearResided)) {
        startText = yearResided
      }

      replacements = {
        first: nameParts.firstName.toUpperCase(),
        First: nameParts.firstName.toUpperCase(),
        firstname: nameParts.firstName.toUpperCase(),
        middle: nameParts.middleName.toUpperCase(),
        Middle: nameParts.middleName.toUpperCase(),
        middlename: nameParts.middleName.toUpperCase(),
        mi: nameParts.middleName ? nameParts.middleName.charAt(0).toUpperCase() : '',
        last: nameParts.lastName.toUpperCase(),
        Last: nameParts.lastName.toUpperCase(),
        lastname: nameParts.lastName.toUpperCase(),
        surname: nameParts.lastName.toUpperCase(),
        civil: resident?.civil_status || '',
        Civil: resident?.civil_status || '',
        address: resident?.purok || '',
        Address: resident?.purok || '',
        start: startText,
        day: dayOrd,
        Day: dayOrd,
        daynum: dayNum.toString(),
        month: month,
        Month: month,
        year: year,
        Year: year,
        issued_month: month,
        issued_day: dayNum.toString(),
        issued_year: year,
        contact: submission.form_data.contact || '',
        Contact: submission.form_data.contact || '',
        dateissued: dateIssued,
        certno: '', // removed
        or: '',
        OR: '',
        amount: ''
      }
    }

    // Generate document
    const templateId = TEMPLATES[submission.clearance_type as keyof typeof TEMPLATES]
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template not configured for this clearance type' }, { status: 500 })
    }

    const fileName = `${submission.name} - ${submission.clearance_type.replace('-', ' ')} Clearance`

    const { documentUrl } = await generateClearanceDocument(
      templateId,
      OUTPUT_FOLDER_ID,
      replacements,
      fileName
    )

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

    return NextResponse.json({ 
      success: true, 
      documentUrl 
    })

  } catch (error) {
    console.error('Error generating clearance:', error)
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
