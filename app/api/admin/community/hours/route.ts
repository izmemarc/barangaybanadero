import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const hours = db.prepare('SELECT * FROM office_hours ORDER BY order_index ASC').all();
    return NextResponse.json(hours);
  } catch (error) {
    console.error('Error fetching office hours:', error);
    return NextResponse.json({ error: 'Failed to fetch office hours' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, day, hours } = await request.json();
    
    db.prepare('UPDATE office_hours SET day = ?, hours = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(day, hours, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating office hours:', error);
    return NextResponse.json({ error: 'Failed to update office hours' }, { status: 500 });
  }
}

