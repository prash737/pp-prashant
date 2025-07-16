
-- Create user profiles table (extends Supabase auth.users)
CREATE TYPE user_role AS ENUM ('student', 'mentor', 'institution');
CREATE TYPE age_group AS ENUM ('early-childhood', 'elementary', 'middle-school', 'high-school', 'young-adult');
CREATE TYPE education_level AS ENUM ('pre_school', 'school', 'high_school', 'undergraduate', 'graduate', 'post_graduate', 'phd');

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create student profiles table
CREATE TABLE student_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  age_group age_group NOT NULL,
  education_level education_level NOT NULL,
  parent_email TEXT,
  parent_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create mentor profiles table
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

-- Create institution categories table
CREATE TABLE institution_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create institution types table  
CREATE TABLE institution_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES institution_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, slug)
);

-- Create institution profiles table
CREATE TABLE institution_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  institution_name TEXT NOT NULL,
  institution_type_id UUID REFERENCES institution_types(id),
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create student education history table
CREATE TABLE student_education_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institution_profiles(id),
  institution_name TEXT NOT NULL,
  institution_type_id UUID REFERENCES institution_types(id),
  degree_program TEXT,
  field_of_study TEXT,
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

-- Create skills table
CREATE TABLE skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user skills table
CREATE TABLE user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, skill_id)
);

-- Create interests table
CREATE TABLE interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user interests table
CREATE TABLE user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id UUID REFERENCES interests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, interest_id)
);

-- Create goals table
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

-- Create mentor expertise table
CREATE TABLE mentor_expertise (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  years_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create mentor experience table
CREATE TYPE experience_type AS ENUM ('work', 'education', 'volunteer', 'certification');

CREATE TABLE mentor_experience (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  type experience_type NOT NULL,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create mentor availability table
CREATE TABLE mentor_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  time_slot TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(mentor_id, time_slot)
);

-- Create institution programs table
CREATE TABLE institution_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institution_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  level TEXT NOT NULL,
  duration TEXT NOT NULL,
  duration_type TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT,
  outcomes TEXT,
  assessment TEXT,
  certification TEXT,
  schedule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create institution events table
CREATE TABLE institution_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institution_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  registration_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create institution gallery table
CREATE TABLE institution_gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institution_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create mentorship relationships table
CREATE TABLE mentorships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(mentor_id, student_id)
);

-- Create feed posts table
CREATE TABLE feed_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create post comments table
CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create post likes table
CREATE TABLE post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_education_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_expertise ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (these can be refined later)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_profiles_modtime
BEFORE UPDATE ON student_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mentor_profiles_modtime
BEFORE UPDATE ON mentor_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_institution_categories_modtime
BEFORE UPDATE ON institution_categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_institution_types_modtime
BEFORE UPDATE ON institution_types
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_institution_profiles_modtime
BEFORE UPDATE ON institution_profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_education_history_modtime
BEFORE UPDATE ON student_education_history
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_skills_modtime
BEFORE UPDATE ON user_skills
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_goals_modtime
BEFORE UPDATE ON goals
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mentor_expertise_modtime
BEFORE UPDATE ON mentor_expertise
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mentor_experience_modtime
BEFORE UPDATE ON mentor_experience
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_institution_programs_modtime
BEFORE UPDATE ON institution_programs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_institution_events_modtime
BEFORE UPDATE ON institution_events
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mentorships_modtime
BEFORE UPDATE ON mentorships
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_feed_posts_modtime
BEFORE UPDATE ON feed_posts
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
