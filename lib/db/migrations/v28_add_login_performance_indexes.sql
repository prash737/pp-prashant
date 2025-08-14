
-- Migration v28: Add performance indexes for login queries
-- This migration adds indexes to optimize login-related database queries

-- Index for user profile lookup by ID (primary login query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_login_fields 
ON profiles (id) 
INCLUDE (first_name, last_name, email, role, profile_image_url, bio, onboarding_completed);

-- Index for student profile onboarding check
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_student_id_onboarding 
ON student_profiles (student_id) 
INCLUDE (id);

-- Index for email-based lookups (if needed for future features)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email_active 
ON profiles (email) 
WHERE email IS NOT NULL;

-- Add comment for tracking
COMMENT ON INDEX idx_profiles_id_login_fields IS 'Optimizes profile lookup during login process';
COMMENT ON INDEX idx_student_profiles_student_id_onboarding IS 'Optimizes student onboarding status check during login';
COMMENT ON INDEX idx_profiles_email_active IS 'Optimizes email-based profile lookups';
