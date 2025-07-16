
-- Migration: Add link_preview column to feed_posts table
-- This enables storing JSON data for link previews in posts

ALTER TABLE feed_posts 
ADD COLUMN link_preview JSONB;

-- Add comment for documentation
COMMENT ON COLUMN feed_posts.link_preview IS 'JSON data containing link preview information (title, description, image, url)';
