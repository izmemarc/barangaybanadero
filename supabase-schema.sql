-- Supabase database schema for clearance submissions

-- Create residents table
CREATE TABLE IF NOT EXISTS residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  birthdate DATE,
  age INTEGER,
  gender TEXT CHECK (gender IN ('M', 'F', 'Male', 'Female')),
  civil_status TEXT,
  citizenship TEXT DEFAULT 'Filipino',
  purok TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for searching residents
CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_residents_purok ON residents(purok);

-- Enable Row Level Security
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to residents
CREATE POLICY "Allow public read" ON residents
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow authenticated users to insert/update residents (for admin)
CREATE POLICY "Allow authenticated write" ON residents
  FOR ALL
  TO authenticated
  USING (true);

-- Create clearance_submissions table
CREATE TABLE IF NOT EXISTS clearance_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clearance_type TEXT NOT NULL CHECK (clearance_type IN ('barangay', 'business', 'blotter', 'facility', 'good-moral', 'indigency', 'residency')),
  name TEXT NOT NULL,
  form_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on clearance_type for faster queries
CREATE INDEX IF NOT EXISTS idx_clearance_type ON clearance_submissions(clearance_type);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_status ON clearance_submissions(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_created_at ON clearance_submissions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE clearance_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public submissions)
CREATE POLICY "Allow public insert" ON clearance_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to view all submissions (for admin)
CREATE POLICY "Allow authenticated read" ON clearance_submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update submissions (for admin)
CREATE POLICY "Allow authenticated update" ON clearance_submissions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clearance_submissions_updated_at
  BEFORE UPDATE ON clearance_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
