import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename (remove extension, sanitize, add .webp)
    const originalName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, '') // Remove special characters
      .toLowerCase(); // Convert to lowercase
    const timestamp = Date.now();
    const filename = `${originalName}_${timestamp}.webp`;
    const filepath = path.join(process.cwd(), 'public', filename);

    // Convert to WebP using Sharp
    await sharp(buffer)
      .webp({ quality: 85 })
      .toFile(filepath);

    // Return the public path
    const publicPath = `/${filename}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Delete image
export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const filepath = path.join(process.cwd(), 'public', filename);
    await unlink(filepath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

