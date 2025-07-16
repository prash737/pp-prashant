-- Migration to add birth_month column to student_profiles table
ALTER TABLE student_profiles ADD COLUMN birth_month TEXT;
-- Migration to add birth_year column to student_profiles table
ALTER TABLE student_profiles ADD COLUMN birth_year TEXT;
