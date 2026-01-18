# OAuth Setup Instructions

Service accounts have 0 storage due to Google bug. Switched to OAuth with your personal account.

## Setup Steps

### 1. Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials?project=banadero
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: "Barangay Docs Generator"
5. Authorized redirect URIs: `http://localhost:3000/api/oauth/callback`
6. Click "Create"
7. Copy Client ID and Client Secret

### 2. Update .env.local
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### 3. Get Refresh Token
1. Restart dev server: `npm run dev`
2. Visit: http://localhost:3000/api/oauth/setup
3. Copy the `authUrl` from response
4. Open that URL in browser
5. Sign in with izmemarc@gmail.com
6. Click "Allow"
7. Copy the `refresh_token` from callback response
8. Add to `.env.local`: `GOOGLE_REFRESH_TOKEN=your-token-here`

### 4. Restart & Test
1. Restart dev server
2. Try generating a document from admin panel
3. Files now created in YOUR Drive using YOUR 100GB quota

## Why This Works
- Service accounts: 15GB limit, broken by Google
- OAuth: Uses your personal account's quota (100GB)
- Refresh token: Auto-renews access without repeated login
