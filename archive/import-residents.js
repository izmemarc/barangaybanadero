const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('Supabase Key:', supabaseKey ? '✓ Found' : '✗ Missing');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Make sure .env.local exists with:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to convert Excel date serial to JS Date
function excelDateToJSDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
}

async function importResidents() {
  console.log('📊 Reading DB.xlsx...');
  
  // Read Excel file
  const workbook = XLSX.readFile('DB.xlsx');
  const worksheet = workbook.Sheets['Residents'];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  console.log(`✓ Found ${data.length} residents\n`);
  
  // Transform data to match database schema
  const residents = data.map(row => ({
    last_name: row.LastName || '',
    first_name: row.FirstName || '',
    middle_name: row.MiddleName || null,
    birthdate: excelDateToJSDate(row.Birthdate),
    age: row.Age || null,
    gender: row.Gender || null,
    civil_status: row.CivilStatus || null,
    citizenship: row.Citizenship || 'Filipino',
    purok: row.Purok || null
  }));
  
  // Import in batches of 100
  const batchSize = 100;
  let imported = 0;
  let errors = 0;
  
  for (let i = 0; i < residents.length; i += batchSize) {
    const batch = residents.slice(i, i + batchSize);
    
    const { data: result, error } = await supabase
      .from('residents')
      .insert(batch);
    
    if (error) {
      console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors += batch.length;
    } else {
      imported += batch.length;
      console.log(`✓ Imported ${imported} / ${residents.length} residents`);
    }
  }
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Errors: ${errors}`);
}

importResidents().catch(console.error);
