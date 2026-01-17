import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive'
]

// Get auth client using OAuth refresh token
function getAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || ''
  
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing OAuth credentials. Need: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN')
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3001/api/oauth/callback'
  )

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })

  console.log(`[Google Docs] Using OAuth (your personal Drive quota)`)

  return oauth2Client
}

// Copy template and replace placeholders
export async function generateClearanceDocument(
  templateId: string,
  outputFolderId: string,
  replacements: Record<string, string>,
  fileName: string
): Promise<{ documentId: string; documentUrl: string }> {
  try {
    const auth = getAuthClient()
    const drive = google.drive({ version: 'v3', auth })
    const docs = google.docs({ version: 'v1', auth })

    // Copy template to output folder (uses YOUR Drive quota)
    const copy = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: fileName,
        parents: [outputFolderId]
      },
      fields: 'id'
    })
    
    const documentId = copy.data.id!
    console.log(`[Google Docs] Created document: ${documentId}`)

    // Build replacement requests
    const requests = Object.entries(replacements).map(([placeholder, value]) => ({
      replaceAllText: {
        containsText: {
          text: `{{${placeholder}}}`,
          matchCase: false
        },
        replaceText: value || ''
      }
    }))

    // Apply replacements
    if (requests.length > 0) {
      await docs.documents.batchUpdate({
        documentId,
        requestBody: { requests }
      })
    }

    const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`

    return { documentId, documentUrl }
  } catch (error) {
    console.error('Error generating document:', error)
    throw error
  }
}

// Insert photo into document
export async function insertPhotoIntoDocument(
  documentId: string,
  photoUrl: string,
  placeholder: string = '{{picture}}'
): Promise<void> {
  try {
    const auth = getAuthClient()
    const docs = google.docs({ version: 'v1', auth })

    // Find placeholder location
    const doc = await docs.documents.get({ documentId })
    
    // This is simplified - you'd need to find exact location and insert image
    // Google Docs API image insertion is complex, may need Drive API for this
    
    console.log('Photo insertion requires additional implementation')
  } catch (error) {
    console.error('Error inserting photo:', error)
    throw error
  }
}

// Helper to generate OAuth URL (run once to get refresh token)
export function generateAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID || ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
  
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3001/api/oauth/callback'
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })

  return { authUrl, oauth2Client }
}
