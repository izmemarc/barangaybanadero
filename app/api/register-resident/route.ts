import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyNewSubmission } from '@/lib/philsms'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.birthdate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate photo is present
    if (!formData.photo) {
      return NextResponse.json(
        { error: 'Photo is required' },
        { status: 400 }
      )
    }

    // Check for duplicate (same first, last, birthdate)
    const { data: existing } = await supabase
      .from('residents')
      .select('id, first_name, last_name, birthdate, purok')
      .ilike('first_name', formData.firstName)
      .ilike('last_name', formData.lastName)
      .eq('birthdate', formData.birthdate)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Potential duplicate found',
          duplicate: {
            name: `${existing.first_name} ${existing.last_name}`,
            birthdate: existing.birthdate,
            purok: existing.purok
          }
        },
        { status: 409 }
      )
    }

    // Calculate age from birthdate
    const birthDate = new Date(formData.birthdate)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    // Upload photo to Supabase Storage
    let photoPath: string | null = null
    if (formData.photo) {
      try {
        // Convert base64 to buffer
        const base64Data = formData.photo.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        
        // Generate filename: LASTNAME-FIRSTNAME-MIDDLENAME.jpg
        const normalize = (str: string) => {
          return str.toUpperCase()
            .trim()
            .replace(/\s+/g, '-')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/Ñ/g, 'N')
            .replace(/ñ/g, 'N')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        }
        
        const nameParts = [
          normalize(formData.lastName),
          normalize(formData.firstName),
          formData.middleName ? normalize(formData.middleName) : ''
        ].filter(v => v).join('-')
        
        const filename = formData.suffix 
          ? `${nameParts}-${normalize(formData.suffix)}.jpg`
          : `${nameParts}.jpg`
        
        // Upload to extracted_images bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('extracted_images')
          .upload(filename, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          })
        
        if (uploadError) {
          console.error('[Photo] Upload error:', uploadError)
          throw new Error('Failed to upload photo')
        }
        
        photoPath = uploadData.path
        console.log('[Photo] Uploaded successfully:', photoPath)
      } catch (photoError) {
        console.error('[Photo] Error processing photo:', photoError)
        return NextResponse.json(
          { error: 'Failed to process photo' },
          { status: 500 }
        )
      }
    }

    // Save to pending registrations table (not residents yet)
    const { data, error } = await supabase
      .from('pending_registrations')
      .insert({
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        suffix: formData.suffix || null,
        birthdate: formData.birthdate,
        age: age,
        gender: formData.gender,
        civil_status: formData.civilStatus,
        citizenship: formData.citizenship || 'Filipino',
        purok: formData.purok,
        contact: formData.contact || null,
        status: 'pending',
        photo_path: photoPath
      })
      .select()
      .single()

    if (error) throw error

    // Send SMS notification
    try {
      console.log('[SMS] Attempting to send notification for registration...')
      const fullName = `${formData.firstName} ${formData.middleName || ''} ${formData.lastName}`.trim()
      const smsResult = await notifyNewSubmission('resident-registration', fullName)
      if (smsResult?.success) {
        console.log('[SMS] Registration notification sent successfully')
      } else {
        console.error('[SMS] Failed to send registration notification:', smsResult?.error)
      }
    } catch (smsError) {
      console.error('[SMS] Exception sending registration notification:', smsError)
      // Don't fail the request if SMS fails
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully. Pending admin approval.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
