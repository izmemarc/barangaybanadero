import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch approved facility bookings that haven't passed yet
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('clearance_submissions')
      .select('*')
      .eq('clearance_type', 'facility')
      .eq('status', 'approved')
      .gte('form_data->>eventDate', today)
      .order('form_data->>eventDate', { ascending: true })

    if (error) {
      console.error('Error fetching facility bookings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter bookings to only include Basketball Court
    const basketballBookings = (data || []).filter(booking => {
      const facility = booking.form_data?.facility || ''
      return facility.toLowerCase().includes('basketball court')
    })

    return NextResponse.json({ data: basketballBookings }, { status: 200 })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
