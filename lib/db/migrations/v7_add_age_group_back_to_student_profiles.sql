
-- Migration to add age_group column back to student_profiles table
ALTER TABLE student_profiles ADD COLUMN age_group TEXT;
