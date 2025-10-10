# Admin CMS Setup Guide

## Overview

This barangay website now includes a built-in Content Management System (CMS) that allows you to edit content directly from the website without touching code.

## Features

- ✅ **Password Protected** - Secure admin access
- ✅ **Auto-Save Text** - Text changes save automatically after 500ms
- ✅ **Auto-Convert Images** - Uploaded images automatically convert to WebP
- ✅ **Edit Officers** - Add, edit, or remove barangay officials
- ✅ **No External Services** - Everything runs on your Vultr server
- ✅ **SQLite Database** - Lightweight, file-based database

## Setup Instructions

### 1. Set Admin Password

Create a `.env` file in the root directory:

```bash
ADMIN_PASSWORD=your_secure_password_here
```

**Important:** Choose a strong password and keep it secure!

### 2. Initialize Database

The database will be created automatically on first run. It will be stored in:
```
data/content.db
```

### 3. Build and Deploy

```bash
# Install dependencies (if not already done)
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

## How to Use

### Accessing Admin Mode

1. **Click the Settings Icon (⚙️)** in the navigation bar
2. **Enter your admin password**
3. **Edit mode activates** - you'll see edit icons next to editable content

### Editing Content

#### Text Content
- **Auto-saves** after you stop typing (500ms delay)
- Click the pencil icon next to any text
- Edit inline
- Changes save automatically

#### Images
- Click on any image in edit mode
- Upload a new image (JPG, PNG, etc.)
- Image automatically converts to WebP
- Image replaces immediately

#### Barangay Officials
- **Add Officer**: Click the "+" button in the Officials card
- **Edit Officer**: Click on name/position to edit inline
- **Change Photo**: Click the officer's photo
- **Delete Officer**: Click the trash icon (appears on hover)

### Exiting Edit Mode

- Click the Settings icon (⚙️) again to toggle edit mode off
- Click the Logout icon to fully log out

## Database Backup

**Important:** Regularly backup your database!

```bash
# Backup the database
cp data/content.db data/content.db.backup

# Or with timestamp
cp data/content.db data/content.db.$(date +%Y%m%d_%H%M%S)
```

## File Structure

```
barangay-website/
├── data/
│   └── content.db          # SQLite database
├── public/
│   └── *.webp             # Uploaded images
├── app/api/admin/
│   ├── auth/              # Authentication
│   ├── content/           # Text content API
│   ├── officers/          # Officers management
│   ├── projects/          # Projects management
│   └── upload/            # Image upload & conversion
├── components/admin/
│   ├── editable-text.tsx  # Auto-saving text component
│   ├── editable-image.tsx # Image upload component
│   └── admin-login-modal.tsx
├── contexts/
│   └── admin-context.tsx  # Admin state management
└── lib/
    └── db.ts              # Database setup
```

## Current Editable Sections

### ✅ Implemented
- **Community Section**
  - Barangay Officials (add/edit/delete)
  - Officer photos (auto-convert to WebP)
  - Officer names and positions

### 🚧 Coming Soon
- Hero Section (Mission, Vision, Welcome text)
- Projects Section (add/edit/delete projects)
- Contact Information
- Events Calendar

## Troubleshooting

### Can't Login
- Check `.env` file exists with `ADMIN_PASSWORD`
- Restart the server after changing `.env`
- Clear browser cookies

### Images Not Uploading
- Check `public/` folder permissions
- Ensure Sharp package is installed: `pnpm install sharp`
- Check server logs for errors

### Database Errors
- Check `data/` folder exists and is writable
- Try deleting `data/content.db` to recreate (will lose data!)
- Check SQLite is installed: `pnpm install better-sqlite3`

### Changes Not Saving
- Check browser console for errors
- Ensure you're logged in (Settings icon should be highlighted)
- Check network tab for failed API calls

## Security Notes

1. **Never commit `.env` file** - It contains your password
2. **Use HTTPS in production** - Protects password during login
3. **Regular backups** - Backup database before major changes
4. **Strong password** - Use a complex, unique password
5. **Update password regularly** - Change password periodically

## API Endpoints

- `POST /api/admin/auth` - Login
- `DELETE /api/admin/auth` - Logout
- `GET /api/admin/auth` - Check auth status
- `GET/POST /api/admin/content` - Text content
- `GET/POST/PUT/DELETE /api/admin/officers` - Officers management
- `GET/POST/PUT/DELETE /api/admin/projects` - Projects management
- `POST /api/admin/upload` - Image upload

## Support

For issues or questions, check:
1. Browser console for errors
2. Server logs for API errors
3. Database file exists and is readable
4. All dependencies are installed

---

**Version:** 1.0  
**Last Updated:** October 9, 2025

