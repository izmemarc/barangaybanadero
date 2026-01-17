import { generateAuthUrl } from '@/lib/google-docs'
import { NextResponse } from 'next/server'

// Step 1: Visit /api/oauth/setup to get authorization URL
export async function GET() {
  try {
    const { authUrl } = generateAuthUrl()
    
    return NextResponse.json({
      message: 'Open this URL in browser to authorize:',
      authUrl,
      instructions: [
        '1. Open the authUrl in your browser',
        '2. Sign in with izmemarc@gmail.com',
        '3. Click "Allow"',
        '4. You will be redirected to /api/oauth/callback',
        '5. Copy the refresh_token from the response',
        '6. Add it to .env.local as GOOGLE_REFRESH_TOKEN'
      ]
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
