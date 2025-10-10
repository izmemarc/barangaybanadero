import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token;
}

export async function GET() {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY order_index ASC').all();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, date, image_path } = await request.json();

    if (!title || !description || !date || !image_path) {
      return NextResponse.json(
        { error: 'Title, description, date, and image are required' },
        { status: 400 }
      );
    }

    // Get max order_index
    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM projects').get() as { max: number | null };
    const newOrder = (maxOrder.max || 0) + 1;

    const stmt = db.prepare(`
      INSERT INTO projects (title, description, date, image_path, order_index, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const result = stmt.run(title, description, date, image_path, newOrder);

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, title, subtitle, description, date, beneficiaries, image_path } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (subtitle !== undefined) {
      updates.push('subtitle = ?');
      values.push(subtitle);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (date !== undefined) {
      updates.push('date = ?');
      values.push(date);
    }
    if (beneficiaries !== undefined) {
      updates.push('beneficiaries = ?');
      values.push(beneficiaries);
    }
    if (image_path !== undefined) {
      updates.push('image_path = ?');
      values.push(image_path);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE projects SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
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

    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

