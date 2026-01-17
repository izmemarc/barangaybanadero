const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('DB.xlsx');

console.log('Available sheets:', workbook.SheetNames);
console.log('\n');

// Check each sheet
workbook.SheetNames.forEach((sheetName, index) => {
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`Sheet ${index + 1}: "${sheetName}"`);
  console.log(`  Rows: ${data.length}`);
  
  if (data.length > 0) {
    console.log('  Columns:', Object.keys(data[0]).join(', '));
    console.log('  First row sample:', JSON.stringify(data[0]).substring(0, 200));
  }
  console.log('');
});
