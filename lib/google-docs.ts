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
    process.env.GOOGLE_REDIRECT_URI // use env, not hardcoded
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
    // Force token refresh before any API calls
    await auth.getAccessToken()
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
    // Uses <placeholder> format for all templates
    const requests = Object.entries(replacements)
      .filter(([placeholder]) => placeholder.toLowerCase() !== 'picture')
      .map(([placeholder, value]) => ({
        replaceAllText: {
          containsText: {
            text: `<${placeholder}>`,
            matchCase: true  // Keep case-sensitive to match exact placeholder names
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
  } catch (error: any) {
    console.error('Error generating document:', error)
    
    // Check if it's an OAuth error
    if (error.code === 400 || error.message?.includes('invalid_grant')) {
      console.error('❌ OAUTH TOKEN EXPIRED OR INVALID!')
      console.error('👉 Regenerate token at: http://localhost:3001/api/oauth/setup')
      console.error('👉 Or visit: https://banaderolegazpi.online/api/oauth/setup')
    }
    
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
  supabaseClient: any,
  photoPlaceholder: string = '<picture>', // Default to <picture>, but can be customized
  photoSize: number = 90 // Default size in PT (90 PT = ~3.17 cm), can be customized
): Promise<void> {
  try {
    const auth = getAuthClient()
    // Force token refresh before any API calls
    await auth.getAccessToken()
    const docs = google.docs({ version: 'v1', auth })

    // Build expected photo filename patterns
    // Normalize special characters (ñ -> N, etc.)
    const normalize = (str: string) => {
      return str.toUpperCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/Ñ/g, 'N')
        .replace(/ñ/g, 'N')
    }
    
    const clean = (str: string) => normalize(str)
    const baseName = [clean(lastName), clean(firstName), clean(middleName)]
      .filter(v => v)
      .join('-')
    const fullBase = suffix ? `${baseName}-${clean(suffix)}` : baseName
    
    console.log(`[Photo] Name parts - Last: "${lastName}", First: "${firstName}", Middle: "${middleName}"`)
    console.log(`[Photo] Normalized parts - Last: "${clean(lastName)}", First: "${clean(firstName)}", Middle: "${clean(middleName)}"`)
    console.log(`[Photo] Looking for photo with pattern: ${fullBase}`)

    // Search for photo in Supabase Storage
    const bucketName = 'extracted_images'
    const { data: files, error } = await supabaseClient.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error(`[Photo] Error listing files:`, error)
      // Remove placeholder if error
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [{
            replaceAllText: {
              containsText: {
                text: photoPlaceholder,
                matchCase: false
              },
              replaceText: ''
            }
          }]
        }
      })
      return
    }

    // Find matching photo file - normalize both search term and filenames
    // Check if all name parts are present in the filename (order-independent)
    const nameParts = [clean(lastName), clean(firstName), clean(middleName)]
      .filter(v => v && v.length > 0)
    
    console.log(`[Photo] Searching for files containing parts: [${nameParts.join(', ')}]`)
    
    const matchingFile = files?.find((file: any) => {
      const fileName = normalize(file.name)
      
      // Check if it's an image file
      const isImage = fileName.endsWith('.JPG') || fileName.endsWith('.JPEG') || 
                     fileName.endsWith('.PNG') || fileName.endsWith('.jpg') || 
                     fileName.endsWith('.jpeg') || fileName.endsWith('.png')
      
      if (!isImage) return false
      
      // Check if all name parts are present in the filename (regardless of order)
      const allPartsPresent = nameParts.every(part => fileName.includes(part))
      
      if (allPartsPresent) {
        console.log(`[Photo] ✓ Match found: ${file.name} (normalized: ${fileName})`)
      }
      
      return allPartsPresent
    })

    if (!matchingFile) {
      console.log(`[Photo] No photo found for ${fullBase}`)
      // Remove placeholder text
      await docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: [
            {
              replaceAllText: {
                containsText: {
                  text: '<picture>',
                  matchCase: false
                },
                replaceText: ''
              }
            },
            {
              replaceAllText: {
                containsText: {
                  text: '<pic>',
                  matchCase: false
                },
                replaceText: ''
              }
            }
          ]
        }
      })
      return
    }

    console.log(`[Photo] Using photo: ${matchingFile.name}`)

    // Get public URL from Supabase Storage
    const { data: urlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(matchingFile.name)

    const photoUrl = urlData.publicUrl
    console.log(`[Photo] Using URL: ${photoUrl}`)

    // Get current document to find placeholder
    const doc = await docs.documents.get({ documentId })
    const content = doc.data.body?.content || []
    
    let placeholderStart: number | null = null
    let placeholderEnd: number | null = null
    
    // Search for <picture> or <pic> in document (including tables)
    const searchInElements = (elements: any[]): boolean => {
      for (const element of elements) {
        if (element.paragraph) {
          for (const textElement of element.paragraph.elements || []) {
            const text = textElement.textRun?.content || ''
            const lowerText = text.toLowerCase()
            if (lowerText.includes('<picture>') || lowerText.includes('< picture >') || 
                lowerText.includes('<pic>') || lowerText.includes('< pic >')) {
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
      console.log('[Photo] No <picture> or <pic> placeholder found in document')
      return
    }

    // Find the text element containing <picture> or <pic> (search recursively in tables too)
    let textElement: any = null
    
    const findTextElement = (elements: any[]): boolean => {
      for (const element of elements) {
        if (element.paragraph) {
          for (const te of element.paragraph.elements || []) {
            const text = te.textRun?.content || ''
            const lowerText = text.toLowerCase()
            if (lowerText.includes('<picture>') || lowerText.includes('< picture >') ||
                lowerText.includes('<pic>') || lowerText.includes('< pic >')) {
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

    // Find <picture> or <pic> placeholder position
    const lowerContent = textElement.textRun.content.toLowerCase()
    let offset = lowerContent.indexOf('<picture>')
    let length = 9 // '<picture>'.length
    
    if (offset === -1) {
      offset = lowerContent.indexOf('< picture >')
      length = 11 // '< picture >'.length
    }
    
    if (offset === -1) {
      offset = lowerContent.indexOf('<pic>')
      length = 5 // '<pic>'.length
    }
    
    if (offset === -1) {
      offset = lowerContent.indexOf('< pic >')
      length = 7 // '< pic >'.length
    }
    
    if (offset === -1) {
      console.log(`[Photo] Could not find <picture> or <pic> placeholder in text: "${textElement.textRun.content}"`)
      return
    }
    
    const actualStart = placeholderStart! + offset
    const actualEnd = actualStart + length

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
                  magnitude: photoSize,
                  unit: 'PT'
                },
                width: {
                  magnitude: photoSize,
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
    process.env.GOOGLE_REDIRECT_URI // use env, not hardcoded
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',   // REQUIRED for durable refresh token
    prompt: 'consent',        // REQUIRED to force token refresh
    scope: SCOPES
  })

  return { authUrl, oauth2Client }
}
