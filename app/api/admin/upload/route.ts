import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Configure runtime for larger uploads
export const runtime = 'nodejs';
export const maxDuration = 30;

function checkAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    console.log('Auth check - token exists:', !!token);
    console.log('Auth check - token value:', token ? 'present' : 'missing');
    return !!token;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  console.log('Upload API called');
  
  try {
    if (!checkAuth(request)) {
      console.log('Upload failed: Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Upload API: Authentication passed');

    console.log('Upload API: Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('Upload API: File received:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');
    
    if (!file) {
      console.log('Upload failed: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 413 }
      );
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Get file buffer
    console.log('Upload API: Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('Upload API: Buffer created, size:', buffer.length);

    // Generate filename (remove extension, sanitize, add .webp)
    const originalName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-_]/g, '') // Remove special characters
      .toLowerCase(); // Convert to lowercase
    const timestamp = Date.now();
    const filename = `${originalName}_${timestamp}.webp`;
    
    console.log('Upload API: Generated filename:', filename);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    console.log('Upload API: Uploads directory:', uploadsDir);
    
    if (!existsSync(uploadsDir)) {
      console.log('Upload API: Creating uploads directory...');
      await mkdir(uploadsDir, { recursive: true });
    }
    
    const filepath = path.join(uploadsDir, filename);
    console.log('Upload API: Full file path:', filepath);

    // Convert to WebP using Sharp with error handling
    console.log('Upload API: Starting Sharp conversion...');
    try {
      // Try Sharp conversion with proper error handling
      const sharpInstance = sharp(buffer);
      console.log('Upload API: Sharp instance created');
      
      await sharpInstance
        .webp({ quality: 85, effort: 4 })
        .toFile(filepath);
        
      console.log('Upload API: Sharp conversion completed successfully');
    } catch (sharpError) {
      console.error('Sharp conversion error:', sharpError);
      console.error('Sharp error details:', sharpError instanceof Error ? sharpError.stack : 'No stack');
      
      // Try to save as original format if WebP conversion fails
      try {
        console.log('Upload API: Attempting to save original format...');
        const fs = await import('fs/promises');
        await fs.writeFile(filepath.replace('.webp', '.jpg'), buffer);
        console.log('Upload API: Saved as original format');
        return NextResponse.json(
          { error: 'WebP conversion failed, but image saved as JPG', details: sharpError instanceof Error ? sharpError.message : 'Unknown error' },
          { status: 400 }
        );
      } catch (fallbackError) {
        console.error('Fallback save error:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to process and save image', details: sharpError instanceof Error ? sharpError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // Return the public path
    const publicPath = `/uploads/${filename}`;

    console.log(`Upload successful: ${filename} -> ${publicPath}`);

    return NextResponse.json({
      success: true,
      path: publicPath,
      filename
    });
  } catch (error) {
    console.error('Upload API: Unexpected error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
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

