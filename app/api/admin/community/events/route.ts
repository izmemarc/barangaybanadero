import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const events = db.prepare('SELECT * FROM community_events ORDER BY order_index ASC').all();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title, date, time, location, type } = await request.json();
    
    db.prepare('UPDATE community_events SET title = ?, date = ?, time = ?, location = ?, type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(title, date, time, location, type, id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, date, time, location, type } = await request.json();
    
    const result = db.prepare('INSERT INTO community_events (title, date, time, location, type, order_index) VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM community_events))')
      .run(title, date, time, location, type);
    
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    db.prepare('DELETE FROM community_events WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

