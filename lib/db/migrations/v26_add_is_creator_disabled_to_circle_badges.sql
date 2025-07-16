
-- Migration v26: Add is_creator_disabled column to circle_badges table
-- This column tracks when a parent disables a circle for their child who is the creator

ALTER TABLE public.circle_badges 
ADD COLUMN IF NOT EXISTS is_creator_disabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.circle_badges.is_creator_disabled IS 'Indicates if the circle is disabled for the creator by their parent';
