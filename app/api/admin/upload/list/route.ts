import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, existsSync, statSync } from 'fs';
import path from 'path';

function checkAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  return !!token;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({
        exists: false,
        message: 'Uploads directory does not exist',
        path: uploadsDir
      });
    }

    const files = readdirSync(uploadsDir);
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = statSync(filePath);
      return {
        name: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${file}`
      };
    });

    return NextResponse.json({
      exists: true,
      path: uploadsDir,
      fileCount: files.length,
      files: fileDetails
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

