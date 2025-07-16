
-- Add social media and contact fields to profiles table
-- This migration adds the missing social media fields and contact information
-- directly to the profiles table for easier querying

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS behance_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dribbble_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);

-- Add RLS policies for the new fields (they inherit from existing profile policies)
-- The existing "Users can update own profile" policy will cover these new fields

-- Optional: Add constraints for valid URLs (uncomment if needed)
-- ALTER TABLE profiles ADD CONSTRAINT check_instagram_url_format 
--   CHECK (instagram_url IS NULL OR instagram_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_facebook_url_format 
--   CHECK (facebook_url IS NULL OR facebook_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_twitter_url_format 
--   CHECK (twitter_url IS NULL OR twitter_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_behance_url_format 
--   CHECK (behance_url IS NULL OR behance_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_dribbble_url_format 
--   CHECK (dribbble_url IS NULL OR dribbble_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_website_format 
--   CHECK (website IS NULL OR website ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_linkedin_url_format 
--   CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_portfolio_url_format 
--   CHECK (portfolio_url IS NULL OR portfolio_url ~* '^https?://');
-- ALTER TABLE profiles ADD CONSTRAINT check_github_url_format 
--   CHECK (github_url IS NULL OR github_url ~* '^https?://');

-- Add email format constraint
ALTER TABLE profiles ADD CONSTRAINT check_email_format 
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
