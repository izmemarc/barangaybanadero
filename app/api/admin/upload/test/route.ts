import { NextRequest, NextResponse } from 'next/server';
import { existsSync } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const fs = await import('fs');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const publicDir = path.join(process.cwd(), 'public');
    
    let uploadedFiles: string[] = [];
    if (existsSync(uploadsDir)) {
      uploadedFiles = fs.readdirSync(uploadsDir);
    }
    
    return NextResponse.json({
      status: 'Test endpoint working',
      directories: {
        publicExists: existsSync(publicDir),
        uploadsExists: existsSync(uploadsDir),
        publicPath: publicDir,
        uploadsPath: uploadsDir,
      },
      uploadedFiles: uploadedFiles.map(file => ({
        name: file,
        url: `/uploads/${file}`,
        fullPath: path.join(uploadsDir, file)
      })),
      timestamp: new Date().toISOString(),
      cwd: process.cwd(),
      nodeVersion: process.version,
      platform: process.platform,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'Test failed', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test form data parsing without actually uploading
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 'Form data parsed successfully',
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      message: 'File received but not saved (test mode)',
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'Test failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

