import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const contacts = db.prepare('SELECT * FROM emergency_contacts ORDER BY order_index ASC').all();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, number } = await request.json();
    
    db.prepare('UPDATE emergency_contacts SET name = ?, number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(name, number, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

