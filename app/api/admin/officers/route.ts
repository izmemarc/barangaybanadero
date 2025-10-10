import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token;
}

export async function GET() {
  try {
    const officers = db.prepare('SELECT * FROM officers ORDER BY order_index ASC').all();
    return NextResponse.json(officers);
  } catch (error) {
    console.error('Get officers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch officers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, position, image_path } = await request.json();

    if (!name || !position || !image_path) {
      return NextResponse.json(
        { error: 'Name, position, and image are required' },
        { status: 400 }
      );
    }

    // Get max order_index
    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM officers').get() as { max: number | null };
    const newOrder = (maxOrder.max || 0) + 1;

    const stmt = db.prepare(`
      INSERT INTO officers (name, position, image_path, order_index, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(name, position, image_path, newOrder);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create officer error:', error);
    return NextResponse.json(
      { error: 'Failed to create officer' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, position, image_path } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (position !== undefined) {
      updates.push('position = ?');
      values.push(position);
    }
    if (image_path !== undefined) {
      updates.push('image_path = ?');
      values.push(image_path);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE officers SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update officer error:', error);
    return NextResponse.json(
      { error: 'Failed to update officer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM officers WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete officer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete officer' },
      { status: 500 }
    );
  }
}

