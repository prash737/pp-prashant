
# PathPiper - Complete SQL Schema Documentation

This document contains the complete SQL schema for all tables in the PathPiper project. You can copy and paste these schemas as needed.

## Core User System Tables

### 1. User Roles Enum
```sql
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'institution');
CREATE TYPE age_group AS ENUM ('early_childhood', 'elementary', 'middle_school', 'high_school', 'young_adult');
CREATE TYPE education_level AS ENUM ('pre_school', 'school', 'high_school', 'undergraduate', 'graduate', 'post_graduate', 'phd');
CREATE TYPE post_type AS ENUM ('GENERAL', 'ACHIEVEMENT', 'PROJECT', 'QUESTION', 'DISCUSSION', 'TUTORIAL', 'RESOURCE_SHARE', 'EVENT_ANNOUNCEMENT');
```

### 2. Profiles Table (Main User Table)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  profile_image_url TEXT,
  tagline TEXT,
  professional_summary TEXT,
  verification_status BOOLEAN DEFAULT FALSE,
  email TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone TEXT,
  cover_image_url TEXT,
  theme_preference TEXT DEFAULT 'default',
  timezone TEXT,
  availability_status TEXT DEFAULT 'online',
  last_active_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  profile_views INTEGER DEFAULT 0,
  parent_id BIGINT,
  parent_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 3. Student Profiles Table
```sql
CREATE TABLE student_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  age_group age_group,
  education_level education_level NOT NULL,
  birth_month TEXT,
  birth_year TEXT,
  personality_type TEXT,
  learning_style TEXT,
  favorite_quote TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 4. Mentor Profiles Table
```sql
CREATE TABLE mentor_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  profession TEXT NOT NULL,
  organization TEXT,
  years_experience INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  hours_per_week INTEGER DEFAULT 5,
  max_mentees INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 5. Institution Profiles Table
```sql
CREATE TABLE institution_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  institution_name TEXT NOT NULL,
  institution_type TEXT,
  institution_type_id INTEGER,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  overview TEXT,
  mission TEXT,
  core_values JSON,
  verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 6. Parent Profiles Table
```sql
CREATE TABLE parent_profile (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  auth_id UUID,
  verification_token TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Institution Management Tables

### 7. Institution Categories Table
```sql
CREATE TABLE institution_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 8. Institution Types Table
```sql
CREATE TABLE institution_types (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES institution_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(category_id, slug)
);
```

## Education System Tables

### 9. Student Education History Table
```sql
CREATE TABLE student_education_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institution_profiles(id),
  institution_name TEXT NOT NULL,
  institution_type_id INTEGER REFERENCES institution_types(id),
  degree_program TEXT,
  field_of_study TEXT,
  subjects JSON DEFAULT '[]',
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  grade_level TEXT,
  gpa TEXT,
  achievements TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Skills and Interests System Tables

### 10. Skill Categories Table
```sql
CREATE TABLE skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age_group age_group NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 11. Skills Table
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES skill_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 12. User Skills Table
```sql
CREATE TABLE user_skills (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, skill_id)
);
```

### 13. Interest Categories Table
```sql
CREATE TABLE interest_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age_group age_group NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 14. Interests Table
```sql
CREATE TABLE interests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES interest_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 15. User Interests Table
```sql
CREATE TABLE user_interests (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id INTEGER REFERENCES interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, interest_id)
);
```

## Social and Contact Tables

### 16. Social Links Table
```sql
CREATE TABLE social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, platform)
);
```

### 17. Languages Table
```sql
CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 18. User Languages Table
```sql
CREATE TABLE user_languages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, language_id)
);
```

### 19. Hobbies Table
```sql
CREATE TABLE hobbies (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 20. User Hobbies Table
```sql
CREATE TABLE user_hobbies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hobby_id INTEGER REFERENCES hobbies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, hobby_id)
);
```

## Goals and Achievements Tables

### 21. Career Goals Table
```sql
CREATE TABLE career_goals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 22. Goals Table
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  timeframe TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 23. Achievement Categories Table
```sql
CREATE TABLE achievement_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 24. Achievement Types Table
```sql
CREATE TABLE achievement_types (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES achievement_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(category_id, name)
);
```

### 25. User Achievements Table
```sql
CREATE TABLE user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  date_of_achievement DATE NOT NULL,
  achievement_type_id INTEGER REFERENCES achievement_types(id),
  achievement_image_icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Media and Customization Tables

### 26. Mood Board Table
```sql
CREATE TABLE mood_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 27. Custom Badges Table
```sql
CREATE TABLE custom_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  earned_date DATE DEFAULT CURRENT_DATE,
  issuer TEXT,
  verification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Connection System Tables

### 28. Connection Requests Table
```sql
CREATE TABLE connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(sender_id, receiver_id)
);
```

### 29. Connections Table
```sql
CREATE TABLE connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'friend',
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);
```

### 30. Skill Endorsements Table
```sql
CREATE TABLE skill_endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endorsed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(endorser_id, endorsed_user_id, skill_id)
);
```

## Circle Management Tables

### 31. Circle Badges Table
```sql
CREATE TABLE circle_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'users',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 32. Circle Memberships Table
```sql
CREATE TABLE circle_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES circle_badges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'declined', 'left')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(circle_id, user_id)
);
```

### 33. Circle Invitations Table
```sql
CREATE TABLE circle_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES circle_badges(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(circle_id, invitee_id)
);
```

## Feed System Tables

### 34. Feed Posts Table
```sql
CREATE TABLE feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_trail BOOLEAN DEFAULT FALSE,
  parent_post_id UUID REFERENCES feed_posts(id),
  trail_order INTEGER,
  post_type post_type DEFAULT 'GENERAL',
  tags TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',
  age_group TEXT,
  difficulty_level TEXT,
  is_question BOOLEAN DEFAULT FALSE,
  is_achievement BOOLEAN DEFAULT FALSE,
  achievement_type TEXT,
  project_category TEXT,
  moderation_status TEXT DEFAULT 'approved',
  views_count INTEGER DEFAULT 0,
  engagement_score REAL DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_promoted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 35. Post Likes Table
```sql
CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);
```

### 36. Post Comments Table
```sql
CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### 37. Post Bookmarks Table
```sql
CREATE TABLE post_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);
```

## Chatbot System Tables

### 38. Chatbot Themes Table
```sql
CREATE TABLE chatbot_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  primary_color TEXT,
  secondary_color TEXT,
  font_family TEXT,
  allowed_domains JSON DEFAULT '{"links": []}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

## Indexes for Performance

```sql
-- Core profile indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_parent_id ON profiles(parent_id);

-- User interests and skills indexes
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_interest_id ON user_interests(interest_id);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);

-- Education history indexes
CREATE INDEX idx_education_history_student_id ON student_education_history(student_id);
CREATE INDEX idx_education_history_institution_type ON student_education_history(institution_type_id);

-- Connection indexes
CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);
CREATE INDEX idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id);

-- Feed indexes
CREATE INDEX idx_feed_posts_user_id ON feed_posts(user_id);
CREATE INDEX idx_feed_posts_created_at ON feed_posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);

-- Circle indexes
CREATE INDEX idx_circle_memberships_circle_id ON circle_memberships(circle_id);
CREATE INDEX idx_circle_memberships_user_id ON circle_memberships(user_id);
```

## Triggers for Updated_at Fields

```sql
-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables with updated_at
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_student_profiles_modtime BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_mentor_profiles_modtime BEFORE UPDATE ON mentor_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_institution_profiles_modtime BEFORE UPDATE ON institution_profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_institution_categories_modtime BEFORE UPDATE ON institution_categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_institution_types_modtime BEFORE UPDATE ON institution_types FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_student_education_history_modtime BEFORE UPDATE ON student_education_history FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_skill_categories_modtime BEFORE UPDATE ON skill_categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_skills_modtime BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_skills_modtime BEFORE UPDATE ON user_skills FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_interest_categories_modtime BEFORE UPDATE ON interest_categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_interests_modtime BEFORE UPDATE ON interests FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_interests_modtime BEFORE UPDATE ON user_interests FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_social_links_modtime BEFORE UPDATE ON social_links FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_languages_modtime BEFORE UPDATE ON user_languages FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_career_goals_modtime BEFORE UPDATE ON career_goals FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_goals_modtime BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_achievements_modtime BEFORE UPDATE ON user_achievements FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_mood_board_modtime BEFORE UPDATE ON mood_board FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_custom_badges_modtime BEFORE UPDATE ON custom_badges FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_connection_requests_modtime BEFORE UPDATE ON connection_requests FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_circle_badges_modtime BEFORE UPDATE ON circle_badges FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_circle_memberships_modtime BEFORE UPDATE ON circle_memberships FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_circle_invitations_modtime BEFORE UPDATE ON circle_invitations FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_feed_posts_modtime BEFORE UPDATE ON feed_posts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_post_comments_modtime BEFORE UPDATE ON post_comments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_chatbot_themes_modtime BEFORE UPDATE ON chatbot_themes FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_education_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interest_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_themes ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize as needed)
CREATE POLICY "Public profiles viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## Notes

1. **Foreign Key Relationships**: All tables are properly linked with foreign key constraints to maintain data integrity.

2. **UUID vs Serial IDs**: Main profile tables use UUID (linked to Supabase auth), while lookup tables use SERIAL for better performance.

3. **JSON Fields**: Some fields use JSON for flexible data storage (subjects, core_values, allowed_domains).

4. **Constraints**: Check constraints are used for data validation (proficiency levels, status enums, etc.).

5. **Indexes**: Performance indexes are included for commonly queried fields.

6. **Triggers**: Automatic timestamp updates are handled via database triggers.

7. **RLS**: Row Level Security is enabled for all tables for fine-grained access control.

This schema supports the complete PathPiper platform including user management, education tracking, social connections, achievements, and content feeds.
