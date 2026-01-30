# Barangay ID Template Setup Guide

## Issue
The error `File not found: your-template-id` occurs because the Barangay ID template hasn't been created yet in Google Drive.

## Required Steps

### 1. Create the Barangay ID Template in Google Docs

1. Go to Google Drive and create a new Google Docs document
2. Name it something like "Barangay ID Template"
3. Design your Barangay ID card layout in the document

### 2. Add Placeholders to the Template

Based on the code, the system will replace these placeholders:

**Required placeholders (will be filled):**
- `<name>` - Full name in uppercase (will be automatically bolded)
- `<contactno>` or `<contactnumber>` - Contact number

**Optional placeholders (filled from resident data if available):**
- `<purok>` - Purok/Address from resident data
- `<birthday>` - Birthdate from resident data
- `<sex>` - Gender from resident data
- `<citizenship>` - Citizenship from resident data
- `<blood>` or `<bloodtype>` - Blood type from resident data
- `<sss>` - SSS number from resident data
- `<tin>` - TIN number from resident data
- `<passport>` or `<pasport>` - Passport number from resident data
- `<other>` - Other information (currently not used)
- `<precinct>` - Precinct number from resident data
- `<occupation>` - Occupation from resident data
- `<contactperson>` - Emergency contact from resident data
- `<validity>` - Validity period (currently not used)
- `<age>` - Age from resident data
- `<picture>` or `<pic>` - Photo placeholder (will be replaced with resident photo if available in system)

**Example Template Layout:**
```
╔════════════════════════════════════╗
║   BARANGAY BANADERO IDENTIFICATION ║
║                                    ║
║   <picture>                        ║
║                                    ║
║   Name: <name>                     ║
║   Contact: <contactno>             ║
║                                    ║
╚════════════════════════════════════╝
```

### 3. Get the Template ID

1. Open your template document in Google Drive
2. Look at the URL in your browser
3. The URL will look like: `https://docs.google.com/document/d/TEMPLATE_ID_HERE/edit`
4. Copy the `TEMPLATE_ID_HERE` part (the long string between `/d/` and `/edit`)

### 4. Update .env.local

Open your `.env.local` file and replace line 23:

**Current:**
```
BARANGAY_ID_TEMPLATE_ID=your-template-id
```

**Replace with:**
```
BARANGAY_ID_TEMPLATE_ID=YOUR_ACTUAL_TEMPLATE_ID_HERE
```

### 5. Share Template with Service Account (Important!)

The template must be shared with your Google Service Account:

1. Open the template document
2. Click "Share" button
3. Add this email: `banaderodocs@banadero.iam.gserviceaccount.com`
4. Give it "Editor" permissions
5. Click "Send"

### 6. Restart Development Server

After updating the `.env.local` file:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Testing

1. Go to your website
2. Navigate to Barangay ID form
3. Fill in the name and contact number
4. Submit the form
5. In the admin panel, try to generate the document
6. The document should be created successfully with only name and contact number filled in

## Notes

- Only **name** and **contact number** are required fields
- All other fields are populated from the resident database if the resident exists in the system
- The **name** will be automatically formatted in bold in the generated document
- If a resident photo exists in the `extracted_images` bucket, it will be automatically inserted
- If a field is not available in the resident data, it will be left empty in the generated ID
