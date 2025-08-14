
-- Migration v29: Add performance indexes for register and callback APIs
-- Created: January 14, 2025
-- Purpose: Optimize registration and callback API performance

-- Index for faster auth callback profile lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_role_onboarding 
ON profiles (id, role, onboarding_completed);

-- Index for faster student profile creation checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_id_onboarding 
ON student_profiles (id, onboarding_completed);

-- Index for faster mentor profile creation checks  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mentor_profiles_id_onboarding 
ON mentor_profiles (id, onboarding_completed);

-- Index for faster institution profile creation checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_institution_profiles_id_onboarding 
ON institution_profiles (id, onboarding_completed);

-- Index for faster institution type validation during registration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_institution_types_id_name 
ON institution_types (id, name);

-- Index for faster onboarding completion checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interests_userid_created 
ON user_interests (user_id, created_at);

-- Index for faster education history checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_education_studentid_created 
ON student_education_history (student_id, created_at);

-- Analyze tables for optimal query planning
ANALYZE profiles;
ANALYZE student_profiles;
ANALYZE mentor_profiles;
ANALYZE institution_profiles;
ANALYZE institution_types;
ANALYZE user_interests;
ANALYZE student_education_history;

-- Log migration completion
INSERT INTO migration_log (version, description, executed_at) 
VALUES ('v29', 'Add performance indexes for register and callback APIs', NOW())
ON CONFLICT (version) DO UPDATE SET 
  executed_at = NOW(),
  description = EXCLUDED.description;
