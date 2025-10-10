import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Admin password from environment variable (should be bcrypt hashed)
// Fallback hash for local development (password: banadero)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '$2b$10$xXCCrkJAX7zbODYyN47Nnev9/dTKZE7001IQW4Cn/heZd9szAn8w.';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Compare password with bcrypt hash
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD);

    if (isValid) {
      // Create a simple session token
      const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64');
      
      return NextResponse.json(
        { success: true, token },
        { 
          status: 200,
          headers: {
            'Set-Cookie': `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': 'admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
      }
    }
  );
}

// Verify token
export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  
  if (token) {
    return NextResponse.json({ authenticated: true });
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

