import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

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
