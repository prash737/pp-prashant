
-- Add parent verification fields to profiles table
ALTER TABLE profiles 
ADD COLUMN parent_id BIGINT REFERENCES parent_profile(id),
ADD COLUMN parent_verified BOOLEAN DEFAULT FALSE;

-- Add verification_token field to parent_profile table
ALTER TABLE parent_profile 
ADD COLUMN verification_token TEXT;

-- Create index for better performance
CREATE INDEX idx_profiles_parent_id ON profiles(parent_id);
CREATE INDEX idx_parent_profile_verification_token ON parent_profile(verification_token);
