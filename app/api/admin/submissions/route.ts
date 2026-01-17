import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('[API] GET /api/admin/submissions started')
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('clearance_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const queryStart = Date.now()
    const { data, error } = await query
    console.log(`[API] Supabase query took ${Date.now() - queryStart}ms`)

    if (error) throw error

    console.log(`[API] GET /api/admin/submissions completed in ${Date.now() - startTime}ms, rows: ${data?.length || 0}`)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[API] Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { submissionId, status } = await request.json()

    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase
      .from('clearance_submissions')
      .update({ status })
      .eq('id', submissionId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}
