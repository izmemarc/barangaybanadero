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
    const { clearanceType, name, formData, residentId } = body

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
