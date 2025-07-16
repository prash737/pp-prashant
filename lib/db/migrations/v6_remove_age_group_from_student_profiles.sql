
-- Migration to remove age_group column from student_profiles table
ALTER TABLE student_profiles DROP COLUMN IF EXISTS age_group;
