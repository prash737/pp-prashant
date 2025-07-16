
-- Migration v9: Add missing fields for student profile sections
-- Run this migration in Supabase SQL editor

-- Add missing fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_summary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_status BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'default';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'online';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;

-- Add missing fields to student_profiles table
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS birth_month TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS birth_year TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS personality_type TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS learning_style TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS favorite_quote TEXT;

-- Create social_links table (normalized approach)
CREATE TABLE IF NOT EXISTS social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, platform)
);

-- Create languages table and user_languages junction table
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE, -- ISO language code (e.g., 'en', 'es', 'fr')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_languages (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, language_id)
);

-- Create hobbies table and user_hobbies junction table (separate from interests)
CREATE TABLE IF NOT EXISTS hobbies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_hobbies (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  hobby_id INTEGER REFERENCES hobbies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, hobby_id)
);

-- Create career_goals table
CREATE TABLE IF NOT EXISTS career_goals (
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

-- Create mood_board table (for visual inspiration)
CREATE TABLE IF NOT EXISTS mood_board (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  position INTEGER DEFAULT 0, -- for ordering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create custom_badges table
CREATE TABLE IF NOT EXISTS custom_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  earned_date DATE DEFAULT CURRENT_DATE,
  issuer TEXT, -- who gave this badge
  verification_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create connection_requests table
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(sender_id, receiver_id)
);

-- Create connections table (for accepted connections)
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  connection_type TEXT DEFAULT 'friend' CHECK (connection_type IN ('friend', 'mentor', 'mentee', 'colleague')),
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user1_id, user2_id),
  CHECK(user1_id < user2_id) -- Ensure consistent ordering
);

-- Create skill_endorsements table
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endorser_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endorsed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(endorser_id, endorsed_user_id, skill_id)
);

-- Insert common languages
INSERT INTO languages (name, code) VALUES 
  ('English', 'en'),
  ('Spanish', 'es'),
  ('French', 'fr'),
  ('German', 'de'),
  ('Italian', 'it'),
  ('Portuguese', 'pt'),
  ('Russian', 'ru'),
  ('Chinese (Mandarin)', 'zh'),
  ('Japanese', 'ja'),
  ('Korean', 'ko'),
  ('Arabic', 'ar'),
  ('Hindi', 'hi')
ON CONFLICT (name) DO NOTHING;

-- Insert common hobbies
INSERT INTO hobbies (name, category) VALUES 
  ('Reading', 'Intellectual'),
  ('Writing', 'Creative'),
  ('Photography', 'Creative'),
  ('Drawing', 'Creative'),
  ('Painting', 'Creative'),
  ('Music Production', 'Creative'),
  ('Gaming', 'Entertainment'),
  ('Cooking', 'Life Skills'),
  ('Gardening', 'Outdoor'),
  ('Hiking', 'Outdoor'),
  ('Swimming', 'Sports'),
  ('Cycling', 'Sports'),
  ('Running', 'Sports'),
  ('Yoga', 'Wellness'),
  ('Meditation', 'Wellness'),
  ('Travel', 'Adventure'),
  ('Volunteering', 'Community'),
  ('Board Games', 'Social'),
  ('Collecting', 'Personal'),
  ('DIY Projects', 'Creative')
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for new tables
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own social links" ON social_links
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Social links are viewable by everyone" ON social_links FOR SELECT USING (true);

CREATE POLICY "Users can manage own languages" ON user_languages
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User languages are viewable by everyone" ON user_languages FOR SELECT USING (true);

CREATE POLICY "Users can manage own hobbies" ON user_hobbies
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User hobbies are viewable by everyone" ON user_hobbies FOR SELECT USING (true);

CREATE POLICY "Users can manage own career goals" ON career_goals
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Career goals are viewable by everyone" ON career_goals FOR SELECT USING (true);

CREATE POLICY "Users can manage own mood board" ON mood_board
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mood boards are viewable by everyone" ON mood_board FOR SELECT USING (true);

CREATE POLICY "Users can manage own custom badges" ON custom_badges
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Custom badges are viewable by everyone" ON custom_badges FOR SELECT USING (true);

CREATE POLICY "Users can manage own connection requests" ON connection_requests
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their connection requests" ON connection_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Connections are viewable by everyone" ON connections FOR SELECT USING (true);

CREATE POLICY "Users can view skill endorsements" ON skill_endorsements FOR SELECT USING (true);

CREATE POLICY "Users can create skill endorsements" ON skill_endorsements FOR INSERT
  WITH CHECK (auth.uid() = endorser_id AND endorser_id != endorsed_user_id);

-- Create indexes for better performance
CREATE INDEX idx_social_links_user_id ON social_links(user_id);
CREATE INDEX idx_social_links_platform ON social_links(platform);
CREATE INDEX idx_user_languages_user_id ON user_languages(user_id);
CREATE INDEX idx_user_hobbies_user_id ON user_hobbies(user_id);
CREATE INDEX idx_career_goals_user_id ON career_goals(user_id);
CREATE INDEX idx_mood_board_user_id ON mood_board(user_id);
CREATE INDEX idx_custom_badges_user_id ON custom_badges(user_id);
CREATE INDEX idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX idx_connections_user1 ON connections(user1_id);
CREATE INDEX idx_connections_user2 ON connections(user2_id);
CREATE INDEX idx_skill_endorsements_endorsed_user ON skill_endorsements(endorsed_user_id);
CREATE INDEX idx_skill_endorsements_skill ON skill_endorsements(skill_id);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_social_links_modtime
  BEFORE UPDATE ON social_links
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_languages_modtime
  BEFORE UPDATE ON user_languages
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_career_goals_modtime
  BEFORE UPDATE ON career_goals
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_mood_board_modtime
  BEFORE UPDATE ON mood_board
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_custom_badges_modtime
  BEFORE UPDATE ON custom_badges
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_connection_requests_modtime
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
