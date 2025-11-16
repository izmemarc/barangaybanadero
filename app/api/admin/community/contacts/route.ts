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

export async function POST(request: NextRequest) {
  try {
    const { name, number, order_index } = await request.json();
    
    const result = db.prepare('INSERT INTO emergency_contacts (name, number, order_index) VALUES (?, ?, ?)')
      .run(name, number, order_index ?? 0);
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
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

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    db.prepare('DELETE FROM emergency_contacts WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}

