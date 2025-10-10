import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Middleware to check auth
function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key) {
      // Get specific content
      const content = db.prepare('SELECT * FROM content WHERE key = ?').get(key);
      return NextResponse.json(content || null);
    } else {
      // Get all content
      const allContent = db.prepare('SELECT * FROM content').all();
      return NextResponse.json(allContent);
    }
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key, value, type = 'text' } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Upsert content
    const stmt = db.prepare(`
      INSERT INTO content (key, value, type, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        type = excluded.type,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(key, value, type);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

