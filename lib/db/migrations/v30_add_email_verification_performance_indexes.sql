
-- Migration v30: Add performance indexes for email verification APIs
-- This migration adds indexes to optimize parent and student email verification performance

-- Index for parent email verification lookup
CREATE INDEX IF NOT EXISTS idx_parent_profiles_email_verification 
ON public.parent_profiles (email, verification_token) 
WHERE verification_token IS NOT NULL;

-- Index for email verification status lookup on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email_verification 
ON public.profiles (email, email_verified);

-- Index for student ID lookups during verification
CREATE INDEX IF NOT EXISTS idx_profiles_id_email 
ON public.profiles (id, email);

-- Add comment for tracking
COMMENT ON INDEX idx_parent_profiles_email_verification IS 'Optimizes parent email verification token lookup';
COMMENT ON INDEX idx_profiles_email_verification IS 'Optimizes email verification status checks';
COMMENT ON INDEX idx_profiles_id_email IS 'Optimizes student verification lookups';
