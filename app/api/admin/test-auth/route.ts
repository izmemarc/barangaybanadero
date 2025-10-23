import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;
    console.log('Test endpoint - token exists:', !!token);
    
    return NextResponse.json({
      authenticated: !!token,
      timestamp: new Date().toISOString(),
      message: token ? 'Authentication working' : 'No authentication token found'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
