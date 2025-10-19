import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

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
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);

    // Convert to WebP using Sharp
    await sharp(buffer)
      .webp({ quality: 85 })
      .toFile(filepath);

    // Return the public path
    const publicPath = `/uploads/${filename}`;

    console.log(`Upload successful: ${filename} -> ${publicPath}`);

    return NextResponse.json({
      success: true,
      path: publicPath,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Handle both old format (root public) and new format (uploads subdirectory)
    let filepath;
    if (filename.startsWith('uploads/')) {
      filepath = path.join(process.cwd(), 'public', filename);
    } else {
      // Check if file exists in uploads directory first
      const uploadsPath = path.join(process.cwd(), 'public', 'uploads', filename);
      const rootPath = path.join(process.cwd(), 'public', filename);
      
      if (existsSync(uploadsPath)) {
        filepath = uploadsPath;
      } else if (existsSync(rootPath)) {
        filepath = rootPath;
      } else {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    }

    await unlink(filepath);
    console.log(`File deleted: ${filename}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

