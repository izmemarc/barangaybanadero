const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('DB.xlsx');

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Display first few rows to understand structure
console.log('Total rows:', data.length);
console.log('\nFirst 5 rows:');
console.log(JSON.stringify(data.slice(0, 5), null, 2));

// Display column headers
if (data.length > 0) {
  console.log('\nColumn headers:');
  console.log(Object.keys(data[0]));
}

// Save to JSON file for inspection
fs.writeFileSync('residents-preview.json', JSON.stringify(data.slice(0, 10), null, 2));
console.log('\n✓ Saved first 10 rows to residents-preview.json');
