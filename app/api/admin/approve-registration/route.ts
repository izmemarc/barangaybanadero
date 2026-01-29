import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('[Approve Registration] Starting approval process...')
    const { registrationId, processedBy } = await request.json()
    console.log('[Approve Registration] Registration ID:', registrationId)

    if (!registrationId) {
      console.error('[Approve Registration] Missing registrationId')
      return NextResponse.json({ error: 'Missing registrationId' }, { status: 400 })
    }

    // Get registration data
    console.log('[Approve Registration] Fetching registration from pending_registrations...')
    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (fetchError) {
      console.error('[Approve Registration] Fetch error:', fetchError)
      return NextResponse.json({ error: 'Registration not found', details: fetchError.message }, { status: 404 })
    }

    if (!registration) {
      console.error('[Approve Registration] Registration not found')
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    console.log('[Approve Registration] Found registration:', {
      id: registration.id,
      name: `${registration.first_name} ${registration.last_name}`,
      birthdate: registration.birthdate
    })

    // Check again for duplicates
    console.log('[Approve Registration] Checking for duplicates in residents table...')
    const { data: existing, error: duplicateCheckError } = await supabase
      .from('residents')
      .select('id')
      .ilike('first_name', registration.first_name)
      .ilike('last_name', registration.last_name)
      .eq('birthdate', registration.birthdate)
      .maybeSingle()

    if (duplicateCheckError) {
      console.error('[Approve Registration] Duplicate check error:', duplicateCheckError)
      throw duplicateCheckError
    }

    if (existing) {
      console.error('[Approve Registration] Duplicate resident found:', existing.id)
      return NextResponse.json({ error: 'Duplicate resident already exists' }, { status: 409 })
    }

    console.log('[Approve Registration] No duplicates found, proceeding with insert...')

    // Add to residents table (include suffix and contact from pending_registrations)
    const insertData = {
      first_name: registration.first_name,
      middle_name: registration.middle_name,
      last_name: registration.last_name,
      suffix: registration.suffix || null,
      birthdate: registration.birthdate,
      age: registration.age,
      gender: registration.gender,
      civil_status: registration.civil_status,
      citizenship: registration.citizenship,
      purok: registration.purok,
      contact: registration.contact || null
    }
    console.log('[Approve Registration] Insert data:', insertData)

    const { error: insertError } = await supabase
      .from('residents')
      .insert(insertData)

    if (insertError) {
      console.error('[Approve Registration] Insert error:', insertError)
      console.error('[Approve Registration] Insert error details:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      })
      throw insertError
    }

    console.log('[Approve Registration] Successfully inserted into residents table')

    // Update registration status
    console.log('[Approve Registration] Updating registration status to approved...')
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({
        status: 'approved',
        processed_by: processedBy || 'admin',
        processed_at: new Date().toISOString()
      })
      .eq('id', registrationId)

    if (updateError) {
      console.error('[Approve Registration] Update error:', updateError)
      throw updateError
    }

    console.log('[Approve Registration] Successfully approved registration')
    return NextResponse.json({
      success: true,
      message: 'Registration approved and added to residents'
    })

  } catch (error) {
    console.error('[Approve Registration] ERROR:', error)
    console.error('[Approve Registration] Error type:', typeof error)
    console.error('[Approve Registration] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      raw: error
    })
    return NextResponse.json(
      { error: 'Failed to approve registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
