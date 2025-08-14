
-- Student Profile API Performance Indexes
-- These indexes optimize the most critical queries in the student profile API

-- Core profile lookup index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_role 
ON profiles(id, role) 
WHERE role = 'student';

-- Student profile lookup index  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_profiles_id_lookup 
ON student_profiles(id);

-- Education history with ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_student_education_student_start_date 
ON student_education_history(student_id, start_date DESC);

-- Institution types join optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_institution_types_id_name 
ON institution_types(id, name);

-- Institution categories join optimization  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_institution_categories_id_name 
ON institution_categories(id, name);

-- User interests with joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interests_user_interest 
ON user_interests(user_id, interest_id);

-- User skills with joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_skills_user_skill 
ON user_skills(user_id, skill_id);

-- Interest categories for joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interests_id_category 
ON interests(id, category_id);

-- Skill categories for joins  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skills_id_category 
ON skills(id, category_id);

-- Social links user lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_social_links_user 
ON social_links(user_id);

-- Custom badges user lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_custom_badges_user 
ON custom_badges(user_id);

-- Goals user lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_goals_user 
ON goals(user_id);

-- Achievements user lookup  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_achievements_user 
ON achievements(user_id);

-- Mood board with position ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_board_user_position 
ON mood_board(user_id, position);

-- Connections optimization (both directions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connections_user1_status 
ON connections(user1_id, status) 
WHERE status = 'accepted';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connections_user2_status 
ON connections(user2_id, status) 
WHERE status = 'accepted';

-- Composite index for profile + student data join
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_students_composite 
ON profiles(id) 
INCLUDE (first_name, last_name, bio, location, profile_image_url, cover_image_url, verification_status, role);
