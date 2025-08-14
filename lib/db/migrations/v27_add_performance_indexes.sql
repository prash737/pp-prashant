
-- Performance indexes for authentication APIs
-- These indexes will dramatically speed up auth queries

-- Index for profiles table (most critical)
CREATE INDEX IF NOT EXISTS idx_profiles_id_fast ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email_fast ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role_fast ON profiles(role);

-- Indexes for role-specific tables
CREATE INDEX IF NOT EXISTS idx_student_profiles_id_fast ON student_profiles(id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_id_fast ON mentor_profiles(id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_id_fast ON institution_profiles(id);

-- Indexes for onboarding completion checks
CREATE INDEX IF NOT EXISTS idx_skill_user_interests_userid_fast ON skill_user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_student_education_history_studentid_fast ON student_education_history(student_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_id_role_fast ON profiles(id, role);

-- Update table statistics for better query planning
ANALYZE profiles;
ANALYZE student_profiles;
ANALYZE mentor_profiles;
ANALYZE institution_profiles;
ANALYZE skill_user_interests;
ANALYZE student_education_history;
