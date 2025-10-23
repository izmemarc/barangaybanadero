import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to import Sharp
    const sharp = (await import('sharp')).default;
    
    // Get Sharp version and format support
    const formats = sharp.format;
    const version = sharp.versions;
    
    return NextResponse.json({
      status: 'Sharp is available',
      version,
      formats: Object.keys(formats),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sharp test error:', error);
    return NextResponse.json(
      { 
        status: 'Sharp is NOT available', 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      },
      { status: 500 }
    );
  }
}

