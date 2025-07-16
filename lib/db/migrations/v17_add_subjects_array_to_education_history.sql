
-- Migration: Add subjects array column to student_education_history table
-- This allows storing multiple subjects for each education entry

-- Add subjects column as JSONB array
ALTER TABLE student_education_history 
ADD COLUMN subjects JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance on subjects
CREATE INDEX idx_student_education_history_subjects 
ON student_education_history USING GIN (subjects);

-- Update existing records to have empty subjects array if null
UPDATE student_education_history 
SET subjects = '[]'::jsonb 
WHERE subjects IS NULL;

-- Add constraint to ensure subjects is always an array
ALTER TABLE student_education_history 
ADD CONSTRAINT check_subjects_is_array 
CHECK (jsonb_typeof(subjects) = 'array');

-- Example data structure for subjects:
-- subjects: ["Mathematics", "Physics", "Chemistry", "English"]
