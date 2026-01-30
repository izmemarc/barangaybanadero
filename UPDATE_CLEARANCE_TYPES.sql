-- Update the check constraint for clearance_submissions table to include new clearance types
-- Run this in Supabase SQL Editor

-- First, drop the existing check constraint
ALTER TABLE clearance_submissions 
DROP CONSTRAINT IF EXISTS clearance_submissions_clearance_type_check;

-- Add the updated check constraint with all clearance types
ALTER TABLE clearance_submissions 
ADD CONSTRAINT clearance_submissions_clearance_type_check 
CHECK (clearance_type IN (
  'barangay',
  'business',
  'blotter',
  'facility',
  'good-moral',
  'indigency',
  'residency',
  'barangay-id',
  'cso-accreditation',
  'luntian'
));
