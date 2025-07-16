
-- Remove social media fields from profiles table (keeping email and phone)
-- The social_links table already exists from v9 migration

ALTER TABLE profiles DROP COLUMN IF EXISTS instagram_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS facebook_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS twitter_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS behance_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS dribbble_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS website;

-- Keep email and phone in profiles as they are core contact info
-- email is the user's registered email for authentication
-- phone is direct contact information

-- The social_links table structure is already created in v9:
-- CREATE TABLE social_links (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
--   platform TEXT NOT NULL,
--   url TEXT NOT NULL,
--   display_name TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
--   UNIQUE(user_id, platform)
-- );

-- Add indexes for social_links if they don't exist
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);

-- Ensure RLS is enabled for social_links
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for social_links if they don't exist
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

-- Add trigger for updated_at if it doesn't exist
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
