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
    let copy
    let retries = 0
    const maxRetries = 3
    
    while (retries < maxRetries) {
      try {
        copy = await drive.files.copy({
          fileId: templateId,
          requestBody: {
            name: fileName,
            parents: [outputFolderId]
          },
          fields: 'id'
        })
        break
      } catch (error: any) {
        if (error.code === 403 && error.message?.includes('rate limit') && retries < maxRetries - 1) {
          retries++
          const waitTime = Math.pow(2, retries) * 1000 // exponential backoff: 2s, 4s, 8s
          console.log(`[Google Docs] Rate limited, retrying in ${waitTime}ms (attempt ${retries}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          throw error
        }
      }
    }
    
    const documentId = copy!.data.id!
    console.log(`[Google Docs] Created document: ${documentId}`)

    // Build replacement requests - exclude 'picture' as it's handled separately
    const requests = Object.entries(replacements)
      .filter(([placeholder]) => placeholder.toLowerCase() !== 'picture')
      .map(([placeholder, value]) => ({
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
  lastName: string,
  firstName: string,
  middleName: string,
  suffix: string,
  photoFolderId: string
): Promise<void> {
  try {
    const auth = getAuthClient()
    const docs = google.docs({ version: 'v1', auth })
    const drive = google.drive({ version: 'v3', auth })

    console.log(`[Photo] Looking for photo: ${lastName}-${firstName}-${middleName}`)

    // Build expected photo filename
    const clean = (str: string) => str.toUpperCase().trim().replace(/\s+/g, ' ')
    const baseName = [clean(lastName), clean(firstName), clean(middleName)]
      .filter(v => v)
      .join('-')
    const fullBase = suffix ? `${baseName}-${clean(suffix)}` : baseName

    // Search for photo in Drive folder
    const searchQuery = `'${photoFolderId}' in parents and name contains '${fullBase}' and trashed=false and (mimeType='image/jpeg' or mimeType='image/png')`
    console.log(`[Photo] Search query: ${searchQuery}`)
    
    const filesList = await drive.files.list({
      q: searchQuery,
      spaces: 'drive',
      fields: 'files(id, name, mimeType)',
      pageSize: 10
    })

    console.log(`[Photo] Found ${filesList.data.files?.length || 0} files`)

    if (!filesList.data.files || filesList.data.files.length === 0) {
      console.log(`[Photo] No photo found for ${fullBase}`)
      // Try to remove placeholder text
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [{
            replaceAllText: {
              containsText: {
                text: '{{picture}}',
                matchCase: false
              },
              replaceText: ''
            }
          }]
        }
      })
      return
    }

    const photoFile = filesList.data.files[0]
    console.log(`[Photo] Using photo: ${photoFile.name} (${photoFile.id})`)

    // Make photo publicly readable temporarily
    await drive.permissions.create({
      fileId: photoFile.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    })

    // Get public URL
    const photoUrl = `https://drive.google.com/uc?export=view&id=${photoFile.id}`
    console.log(`[Photo] Using URL: ${photoUrl}`)

    // Get current document to find placeholder
    const doc = await docs.documents.get({ documentId })
    const content = doc.data.body?.content || []
    
    let placeholderStart: number | null = null
    let placeholderEnd: number | null = null
    
    // Search for {{picture}} in document (including tables)
    const searchInElements = (elements: any[]): boolean => {
      for (const element of elements) {
        if (element.paragraph) {
          for (const textElement of element.paragraph.elements || []) {
            const text = textElement.textRun?.content || ''
            const lowerText = text.toLowerCase()
            if (lowerText.includes('{{picture}}') || lowerText.includes('{{ picture }}')) {
              placeholderStart = textElement.startIndex!
              placeholderEnd = textElement.endIndex!
              console.log(`[Photo] Found placeholder at ${placeholderStart}-${placeholderEnd}, text: "${text}"`)
              return true
            }
          }
        }
        // Search in table cells
        if (element.table) {
          for (const row of element.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              if (searchInElements(cell.content || [])) {
                return true
              }
            }
          }
        }
      }
      return false
    }
    
    searchInElements(content)

    if (placeholderStart === null) {
      console.log('[Photo] No {{picture}} placeholder found in document')
      return
    }

    // Find the text element containing {{picture}} (search recursively in tables too)
    let textElement: any = null
    
    const findTextElement = (elements: any[]): boolean => {
      for (const element of elements) {
        if (element.paragraph) {
          for (const te of element.paragraph.elements || []) {
            const text = te.textRun?.content || ''
            const lowerText = text.toLowerCase()
            if (lowerText.includes('{{picture}}') || lowerText.includes('{{ picture }}')) {
              textElement = te
              console.log(`[Photo] Found text element with content: "${text}"`)
              return true
            }
          }
        }
        if (element.table) {
          for (const row of element.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              if (findTextElement(cell.content || [])) {
                return true
              }
            }
          }
        }
      }
      return false
    }
    
    findTextElement(content)
    
    if (!textElement || !textElement.textRun?.content) {
      console.log('[Photo] Could not find text element')
      return
    }

    const offset = textElement.textRun.content.toLowerCase().indexOf('{{picture}}')
    if (offset === -1) {
      // Try with spaces
      const offsetWithSpaces = textElement.textRun.content.toLowerCase().indexOf('{{ picture }}')
      if (offsetWithSpaces === -1) {
        console.log(`[Photo] Could not find {{picture}} in text: "${textElement.textRun.content}"`)
        return
      }
      const actualStart = placeholderStart! + offsetWithSpaces
      const actualEnd = actualStart + 13 // '{{ picture }}'.length
      console.log(`[Photo] Found with spaces, replacing at ${actualStart}-${actualEnd}`)
      
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              deleteContentRange: {
                range: {
                  startIndex: Number(actualStart),
                  endIndex: Number(actualEnd)
                }
              }
            },
            {
              insertInlineImage: {
                location: {
                  index: Number(actualStart)
                },
                uri: photoUrl,
                objectSize: {
                  height: {
                    magnitude: 90,
                    unit: 'PT'
                  },
                  width: {
                    magnitude: 90,
                    unit: 'PT'
                  }
                }
              }
            }
          ]
        }
      })
      console.log('[Photo] Photo inserted successfully')
      return
    }
    
    const actualStart = placeholderStart! + offset
    const actualEnd = actualStart + 11 // '{{picture}}'.length

    console.log(`[Photo] Replacing text at ${actualStart}-${actualEnd}`)

    // Replace placeholder with image
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: {
                startIndex: Number(actualStart),
                endIndex: Number(actualEnd)
              }
            }
          },
          {
            insertInlineImage: {
              location: {
                index: Number(actualStart)
              },
              uri: photoUrl,
              objectSize: {
                height: {
                  magnitude: 90,
                  unit: 'PT'
                },
                width: {
                  magnitude: 90,
                  unit: 'PT'
                }
              }
            }
          }
        ]
      }
    })

    console.log('[Photo] Photo inserted successfully')
  } catch (error: any) {
    console.error('[Photo] Error:', error.message)
    console.error('[Photo] Full error:', JSON.stringify(error, null, 2))
    // Don't throw - photo is optional
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
