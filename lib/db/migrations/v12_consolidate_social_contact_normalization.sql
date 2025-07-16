
-- V12: Consolidate social contact field normalization
-- This migration removes social media fields from profiles table and ensures 
-- the social_links table is properly set up for normalized social media data

-- Step 1: Remove social media fields from profiles table (keeping email and phone)
ALTER TABLE profiles DROP COLUMN IF EXISTS instagram_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS facebook_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS twitter_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS behance_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS dribbble_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS website;

-- Step 2: Keep email and phone in profiles as they are core contact info
-- email is the user's registered email for authentication
-- phone is direct contact information
-- These fields should already exist, but add them if they don't
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Step 3: Ensure social_links table exists with proper structure
-- This table should already exist from v9 migration, but create if missing
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

-- Step 4: Add indexes for social_links if they don't exist
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);

-- Step 5: Add indexes for contact fields in profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Step 6: Ensure RLS is enabled for social_links
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for social_links if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'social_links' 
        AND policyname = 'Users can manage own social links'
    ) THEN
        CREATE POLICY "Users can manage own social links" ON social_links
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'social_links' 
        AND policyname = 'Social links are viewable by everyone'
    ) THEN
        CREATE POLICY "Social links are viewable by everyone" ON social_links FOR SELECT USING (true);
    END IF;
END$$;

-- Step 8: Add trigger for updated_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_social_links_modtime'
    ) THEN
        CREATE TRIGGER update_social_links_modtime
          BEFORE UPDATE ON social_links
          FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    END IF;
END$$;

-- Step 9: Add email format constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_email_format'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT check_email_format 
          CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;
END$$;

-- Migration completed: Social media fields are now normalized in social_links table
-- Email and phone remain in profiles table as core contact information
