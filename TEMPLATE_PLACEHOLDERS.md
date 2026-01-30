# Google Docs Template Placeholders

This document lists all the placeholders used in each clearance type's Google Docs template. When creating templates in Google Drive, use these exact placeholder names (case-sensitive) in angle brackets: `<placeholder>`

## Linis Ligtas Luntian Request Form

**Template ID Environment Variable:** `LUNTIAN_TEMPLATE_ID`

**Placeholders:**
- `<date>` - Date of request (when form was submitted - formatted as "Month Day, Year")
- `<dateprinted>` - Date printed (when document was generated - formatted as "Month Day, Year")
- `<name>` - Full name of the requestor
- `<items>` - Requested items formatted as bullet list (• item) with single spacing
- `<releaseditems>` - Released items formatted with empty checkboxes (□ item) with single spacing
- `<purpose>` - Purpose of request (textarea)

**Form Fields Collected:**
- Name (text input with resident search)
- Requested items (dropdown - multiple selection):
  - Vegetable seeds
  - Gardening materials / water containers
  - Organic fertilizer / compost
  - Cleaning tools / waste segregation materials
  - Others
- Vegetable seeds (text input - shown when "Vegetable seeds" is selected)
- Requested items details (textarea - shown when "Others" is selected)
- Purpose of request (textarea)
- Contact number (phone)

**Notes:** 
- Date of request is automatically set to when the form is submitted (not manually entered).
- Requested items are formatted as bullet points (•) with single line spacing
- Released items are formatted with empty checkboxes (□) for the barangay to check off, with single line spacing
- If "Vegetable seeds" is selected, the specific seed types (e.g., "Pechay, Kangkong, Eggplant") will be shown in parentheses
- If "Others" is selected, the details from the textarea will be shown in parentheses (e.g., "Others (plastic containers, gloves)")

**Example Template Structure:**
```
REPUBLIC OF THE PHILIPPINES
PROVINCE OF ALBAY
CITY OF LEGAZPI
BARANGAY 6 - BAÑADERO POB. (SAGPON 3)
OFFICE OF THE PUNONG BARANGAY

Linis Ligtas Luntian Request Form

Barangay: Barangay 6, Bañadero, Legazpi City
Program: LINIS LIGTAS LUNTIAN Barangay Challenge
Date of Request: <date>
Name: <name>

Requested Items
<items>

Purpose of Request
<purpose>

RELEASED ITEMS: (to be filled up by the barangay)
<releaseditems>

Noted / Approved By:
Name: ARTHUR R. MARCO
Position: Punong Barangay

Signature: _______________
Date: <dateprinted>
```

---

## CSO/NGO Barangay Accreditation

**Template ID Environment Variable:** `CSO_ACCREDITATION_TEMPLATE_ID`

**Placeholders:**
- `<name>` - Complete name of organization
- `<acronym>` - Acronym (if any)
- `<type>` - Type of organization
- `<nature>` - Nature of organization
- `<agency>` - Registering agency
- `<regnumber>` - Registration number
- `<regdate>` - Date of registration (formatted)
- `<address>` - Office address
- `<number>` - Contact number
- `<email>` - Email address (if any)
- `<pres>` - President name
- `<tpres>` - President tenure
- `<vice>` - Vice President name
- `<tvice>` - Vice President tenure
- `<sec>` - Secretary name
- `<tsec>` - Secretary tenure
- `<tres>` - Treasurer name
- `<ttres>` - Treasurer tenure
- `<aud>` - Auditor name
- `<taud>` - Auditor tenure
- `<members>` - Total number of members
- `<residing>` - Number of members residing in the barangay
- `<vii>` - Track record/areas of advocacy (textarea)
- `<viii>` - Local special bodies/BBIs for representation (textarea)
- `<ix>` - Documentary requirements submitted (to be filled manually)

**Form Fields Collected:**
- Organization name, acronym, type, nature
- Registration details (agency, number, date)
- Office address and contact details
- Officers (President, VP, Secretary, Treasurer, Auditor) with tenures
- Membership numbers (total and barangay residents)
- Track record/advocacy areas
- Local special bodies for representation

**Example Template Structure:**
```
REPUBLIC OF THE PHILIPPINES
PROVINCE OF ALBAY
CITY OF LEGAZPI
BARANGAY 6 - BAÑADERO POB. (SAGPON 3)
OFFICE OF THE PUNONG BARANGAY

CSO/NGO BARANGAY ACCREDITATION

I. BARANGAY INFORMATION
• Barangay 6, Bañadero
• City of Legazpi
• Province of Albay

II. ORGANIZATION INFORMATION
• Complete Name of Organization: <name>
• Acronym (if any): <acronym>
• Type of Organization: <type>
• Nature: <nature>

III. REGISTRATION INFORMATION
• Registering Agency: <agency>
• Registration No.: <regnumber>
• Date of Registration: <regdate>

IV. OFFICE ADDRESS AND CONTACT DETAILS
• Office Address: <address>
• Contact Number: <number>
• Email Address (if any): <email>

V. OFFICERS OF THE ORGANIZATION
Name            Position         Tenure      Remarks
<pres>          President        <tpres>
<vice>          Vice President   <tvice>
<sec>           Secretary        <tsec>
<tres>          Treasurer        <ttres>
<aud>           Auditor          <taud>

VI. MEMBERSHIP
• Total Number of Members: <members>
• Number of Members Residing in the Barangay: <residing>

VII. TRACK RECORD/AREAS OF ADVOCACY
<vii>

VIII. LOCAL SPECIAL BODIES/BBIS FOR REPRESENTATION
(As provided under RA 7160 and DILG issuances)
<viii>
```

---

## Barangay Clearance

**Template ID Environment Variable:** `BARANGAY_TEMPLATE_ID`

**Placeholders:**
- `<LastName>` - Last name (uppercase)
- `<FirstName>` - First name (uppercase)
- `<MiddleName>` - Middle name (uppercase)
- `<Suffix>` - Suffix (uppercase)
- `<Purpose>` - Purpose of clearance
- `<DateIssued>` - Date issued (formatted)
- `<Sex>` - Gender
- `<MaritalStatus>` - Civil status (sentence case)
- `<Citizenship>` - Citizenship
- `<Address>` - Purok/Address
- `<Age>` - Age
- `<Birthdate>` - Birthdate (formatted)
- `{{picture}}` - Photo placeholder (will be replaced with actual photo)

---

## Business Clearance

**Template ID Environment Variable:** `BUSINESS_TEMPLATE_ID`

**Placeholders:**
- `<picture>` - Photo placeholder (will be replaced with actual photo)
- `<FirstName>` - First name (uppercase)
- `<MiddleName>` - Middle name (uppercase)
- `<LastName>` - Last name (uppercase)
- `<Suffix>` - Suffix (uppercase)
- `<Occupation>` - Occupation
- `<Contact>` - Contact number
- `<Business>` - Business name
- `<Address>` - Business address
- `<Purok>` - Purok
- `<Nationality>` - Citizenship
- `<Civil>` - Civil status (sentence case)
- `<DateIssued>` - Date issued (formatted)

---

## Blotter

**Template ID Environment Variable:** `BLOTTER_TEMPLATE_ID`

**Placeholders:**
- `<date>` - Submission date (formatted)
- `<time>` - Submission time
- `<name>` - Complainant name (from form name field or resident)
- `<address>` - Complainant address (from form or resident purok)
- `<contact_no>` - Complainant contact number
- `<age>` - Complainant age (from form or resident)
- `<civil_status>` - Complainant civil status (sentence case)
- `<name2>` - Respondent name
- `<address2>` - Respondent address
- `<age2>` - Respondent age
- `<civil_status2>` - Respondent civil status (sentence case)
- `<incident>` - Type of incident
- `<incident_description>` - Incident description
- `<incident_date>` - Date of incident
- `<incident_place>` - Place of incident
- `<incident_time>` - Time of incident

---

## Facility Request

**Template ID Environment Variable:** `FACILITY_TEMPLATE_ID`

**Placeholders:**
- `<or>` - Official receipt number (left blank)
- `<date>` - Submission date (formatted)
- `<time>` - Submission time
- `<month>` - Month name
- `<day>` - Day number
- `<year>` - Year
- `<name>` - Requestor name (uppercase)
- `<address>` - Address/Purok
- `<contact_no>` - Contact number
- `<civil_status>` - Civil status (sentence case)
- `<age>` - Age
- `<facility>` - Facility name
- `<purpose>` - Purpose of request
- `<usedate>` - Date of use
- `<start>` - Start time
- `<end>` - End time
- `<number>` - Number of participants
- `<equipment>` - Equipment needed
- `<amount>` - Amount/Fee

---

## Good Moral Certificate

**Template ID Environment Variable:** `GOOD_MORAL_TEMPLATE_ID`

**Placeholders (case-sensitive):**
- `<first>` - First name (uppercase)
- `<Middle>` - Middle name (uppercase)
- `<Last>` - Last name (uppercase)
- `<civil>` - Civil status
- `<address>` - Address/Purok
- `<day>` - Day with ordinal (e.g., "1st", "2nd")
- `<month>` - Month name
- `<year>` - Year
- `<pay_month>` - Payment month
- `<pay_day>` - Payment day (zero-padded)
- `<pay_year>` - Payment year

---

## Indigency Certificate

**Template ID Environment Variable:** `INDIGENCY_TEMPLATE_ID`

**Placeholders (case-sensitive):**
- `<first>` - First name (uppercase)
- `<Middle>` - Middle name (uppercase)
- `<Last>` - Last name (uppercase)
- `<age>` - Age
- `<civil>` - Civil status
- `<Purok>` - Purok/Address
- `<day>` - Day with ordinal (e.g., "1st", "2nd")
- `<month>` - Month name
- `<year>` - Year
- `<purpose>` - Purpose

---

## Residency Certificate

**Template ID Environment Variable:** `RESIDENCY_TEMPLATE_ID`

**Placeholders (case-sensitive):**
- `<first>` - First name (uppercase)
- `<Middle>` - Middle name (uppercase)
- `<Last>` - Last name (uppercase)
- `<civil>` - Civil status
- `<address>` - Address/Purok
- `<start>` - Year resided since
- `<day>` - Day with ordinal (e.g., "1st", "2nd")
- `<month>` - Month name
- `<year>` - Year
- `<issued_month>` - Issued month
- `<issued_day>` - Issued day
- `<issued_year>` - Issued year

---

## Barangay ID

**Template ID Environment Variable:** `BARANGAY_ID_TEMPLATE_ID`

**Placeholders:**
- `<pic>` or `<picture>` - Photo placeholder (will be replaced with actual photo)
- `<name>` - Full name (uppercase)
- `<purok>` - Purok/Address
- `<birthday>` - Birthdate (formatted as "Month Day, Year")
- `<age>` - Age (calculated from birthdate)
- `<sex>` - Gender
- `<citizenship>` - Citizenship
- `<blood>` or `<bloodtype>` - Blood type (both work)
- `<contactno>` or `<contactnumber>` - Contact number (both work)
- `<sss>` - SSS Number
- `<tin>` - TIN Number
- `<passport>` or `<pasport>` - Passport Number (both work, handles typo)
- `<other>` - Other ID Number
- `<precinct>` - Precinct Number
- `<occupation>` - Occupation
- `<contactperson>` - Emergency Contact Person
- `<validity>` - ID Validity date (formatted as "Month Day, Year")

**Form Fields Collected:**
- Name (text input with resident search - auto-extracts from database)
- SSS No. (text input - optional)
- TIN No. (text input - optional)
- Passport No. (text input - optional)
- Other ID No. (text input - optional)
- Precinct No. (text input - optional)
- Occupation (text input - required)
- Contact Person (text input - required)
- Contact No. (phone - required)
- Blood Type (dropdown - optional): A+, A-, B+, B-, AB+, AB-, O+, O-, Unknown
- ID Validity (date picker - required)

**Data from Database (auto-extracted when name is selected):**
- Full name (first_name, middle_name, last_name)
- Purok
- Birthdate
- Age (calculated from birthdate)
- Gender
- Citizenship

**Example Template Structure:**
```
REPUBLIC OF THE PHILIPPINES
PROVINCE OF ALBAY
CITY OF LEGAZPI
BARANGAY 6 - BAÑADERO POB. (SAGPON 3)

BARANGAY IDENTIFICATION

{{picture}}

<name>
<purok>, Barangay 6, Bañadero, Legazpi City, Albay Province

BIRTHDAY: <birthday>  AGE: <age>
SEX: <sex>  CITIZENSHIP: <citizenship>
BLOOD TYPE: <bloodtype>  CONTACT NO.: <contactno>

SSS No.: <sss>
TIN No.: <tin>
Passport No.: <passport>
Other ID No.: <other>
Precinct No.: <precinct>
Occupation: <occupation>
Contact Person: <contactperson>

ID VALIDITY: <validity>

Card Holder Signature: _______________
Validating Officer: _______________
```

---

## Notes

1. **Case Sensitivity**: All placeholders are case-sensitive. Use the exact case shown above.
2. **Photo Placeholder**: Use `{{picture}}` (double curly braces) for photo insertion in templates that support photos.
3. **Angle Brackets**: All text placeholders use angle brackets: `<placeholder>`
4. **Date Formatting**: Dates are automatically formatted as "Month Day, Year" (e.g., "January 15, 2026")
5. **Name Formatting**: Names are automatically converted to uppercase where specified.
6. **Ordinal Days**: Days with ordinals are formatted as "1st", "2nd", "3rd", "4th", etc.

## Setup Instructions

1. Create a Google Doc for each clearance type
2. Insert the placeholders exactly as shown above
3. Copy the Google Doc ID from the URL (the long string after `/d/`)
4. Add the template ID to your `.env` file with the corresponding variable name
5. Test the document generation from the admin panel
