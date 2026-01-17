# Import Residents Data

## Prerequisites

1. Complete Supabase setup (see `SUPABASE_SETUP.md`)
2. Run the updated `supabase-schema.sql` to create the `residents` table

## Steps

### 1. Update Database Schema

In Supabase SQL Editor, run the updated `supabase-schema.sql` file. This now includes the `residents` table.

### 2. Run Import Script

```bash
node scripts/import-residents.js
```

This will:
- Read the "Residents" sheet from `DB.xlsx` (1725 rows)
- Transform the data to match the database schema
- Import in batches of 100
- Show progress

### 3. Verify Import

In Supabase dashboard:
1. Go to Table Editor
2. Select `residents` table
3. Check the data

## Database Schema

The `residents` table has:
- `id`: UUID (auto-generated)
- `last_name`: Text
- `first_name`: Text  
- `middle_name`: Text (nullable)
- `birthdate`: Date
- `age`: Integer
- `gender`: Text (M/F)
- `civil_status`: Text
- `citizenship`: Text (default: Filipino)
- `purok`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Troubleshooting

If import fails:
- Check your `.env.local` has correct Supabase credentials
- Verify the `residents` table exists in Supabase
- Check console for specific error messages
