import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || ''
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || ''
    
    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Missing OAuth credentials' 
      }, { status: 500 })
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      'http://localhost:3001/api/oauth/callback'
    )

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    })

    // Try to get a fresh access token
    const { credentials } = await oauth2Client.refreshAccessToken()
    
    return NextResponse.json({ 
      valid: true,
      message: 'OAuth token is valid',
      expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : 'unknown'
    })
  } catch (error: any) {
    return NextResponse.json({ 
      valid: false,
      error: error.message || 'Token validation failed',
      details: error.code === 400 ? 'Token expired or revoked - please regenerate' : error.message
    }, { status: 400 })
  }
}
