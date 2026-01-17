import { google } from 'googleapis'
import { NextRequest, NextResponse } from 'next/server'

// Step 2: OAuth callback endpoint
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3001/api/oauth/callback'
    )

    const { tokens } = await oauth2Client.getToken(code)

    return NextResponse.json({
      message: 'Success! Add this to .env.local:',
      env_variable: `GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`,
      refresh_token: tokens.refresh_token,
      instructions: [
        '1. Copy the refresh_token above',
        '2. Add to .env.local: GOOGLE_REFRESH_TOKEN=your_token_here',
        '3. Restart dev server',
        '4. Document generation will now work'
      ]
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
