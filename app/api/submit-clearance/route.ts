import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { notifyNewSubmission } from '@/lib/philsms'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { clearanceType, name, formData, residentId, capturedPhoto } = body

    console.log('[Photo] Request received:', {
      hasPhoto: !!capturedPhoto,
      photoLength: capturedPhoto?.length,
      residentId,
      clearanceType
    })

    // If photo was captured, upload it to storage and update resident record
    if (capturedPhoto && residentId) {
      console.log('[Photo] Starting upload process...')
      try {
        // Get resident info to generate filename
        console.log('[Photo] Fetching resident info for ID:', residentId)
        const { data: resident, error: residentError } = await supabase
          .from('residents')
          .select('first_name, middle_name, last_name')
          .eq('id', residentId)
          .single()

        if (residentError) {
          console.error('[Photo] Error fetching resident:', residentError)
          throw residentError
        }

        console.log('[Photo] Resident found:', resident)

        if (resident) {
          // Convert base64 to buffer
          console.log('[Photo] Converting base64 to buffer...')
          const base64Data = capturedPhoto.replace(/^data:image\/\w+;base64,/, '')
          const buffer = Buffer.from(base64Data, 'base64')
          console.log('[Photo] Buffer created, size:', buffer.length)
          
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
            normalize(resident.last_name),
            normalize(resident.first_name),
            resident.middle_name ? normalize(resident.middle_name) : ''
          ].filter(v => v).join('-')
          
          const filename = `${nameParts}.jpg`
          
          console.log('[Photo] Generated filename:', filename)
          
          // Upload to extracted_images bucket
          console.log('[Photo] Uploading to Supabase Storage...')
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('extracted_images')
            .upload(filename, buffer, {
              contentType: 'image/jpeg',
              upsert: true
            })
          
          if (uploadError) {
            console.error('[Photo] Upload error:', uploadError)
            console.error('[Photo] Upload error details:', JSON.stringify(uploadError, null, 2))
          } else {
            console.log('[Photo] Upload data:', uploadData)
            console.log('[Photo] Uploaded successfully for resident:', residentId)
          }
        }
      } catch (photoError) {
        console.error('[Photo] Error processing photo:', photoError)
        console.error('[Photo] Error stack:', photoError instanceof Error ? photoError.stack : 'No stack trace')
        // Continue with submission even if photo upload fails
      }
    } else {
      console.log('[Photo] Skipping upload - missing photo or residentId')
    }

    // Insert the submission
    const { data, error } = await supabase
      .from('clearance_submissions')
      .insert({
        clearance_type: clearanceType,
        name: name,
        form_data: formData,
        resident_id: residentId || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('[Supabase] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send SMS notification
    try {
      console.log('[SMS] Attempting to send notification...')
      const smsResult = await notifyNewSubmission(clearanceType, name, formData.purpose)
      if (smsResult?.success) {
        console.log('[SMS] Notification sent successfully')
      } else {
        console.error('[SMS] Failed to send notification:', smsResult?.error)
      }
    } catch (smsError) {
      console.error('[SMS] Exception sending notification:', smsError)
      // Don't fail the request if SMS fails
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit clearance' },
      { status: 500 }
    )
  }
}
