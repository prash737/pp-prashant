-- Add missing columns to institution_profiles table
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS overview TEXT,
ADD COLUMN IF NOT EXISTS mission TEXT,
ADD COLUMN IF NOT EXISTS core_values JSONB;