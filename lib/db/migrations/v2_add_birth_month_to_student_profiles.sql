-- Migration to add birth_month column to student_profiles table
ALTER TABLE student_profiles ADD COLUMN birth_month TEXT;