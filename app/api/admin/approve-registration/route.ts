import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { registrationId, processedBy } = await request.json()

    if (!registrationId) {
      return NextResponse.json({ error: 'Missing registrationId' }, { status: 400 })
    }

    // Get registration data
    const { data: registration, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('id', registrationId)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Check again for duplicates
    const { data: existing } = await supabase
      .from('residents')
      .select('id')
      .ilike('first_name', registration.first_name)
      .ilike('last_name', registration.last_name)
      .eq('birthdate', registration.birthdate)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Duplicate resident already exists' }, { status: 409 })
    }

    // Add to residents table (include suffix and contact from pending_registrations)
    const { error: insertError } = await supabase
      .from('residents')
      .insert({
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
      })

    if (insertError) throw insertError

    // Update registration status
    const { error: updateError } = await supabase
      .from('pending_registrations')
      .update({
        status: 'approved',
        processed_by: processedBy || 'admin',
        processed_at: new Date().toISOString()
      })
      .eq('id', registrationId)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Registration approved and added to residents'
    })

  } catch (error) {
    console.error('Error approving registration:', error)
    return NextResponse.json(
      { error: 'Failed to approve registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
