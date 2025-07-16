
-- Add is_disabled_member column to circle_memberships table
ALTER TABLE circle_memberships 
ADD COLUMN is_disabled_member BOOLEAN DEFAULT FALSE;

-- Add is_disabled column to circle_badges table  
ALTER TABLE circle_badges 
ADD COLUMN is_disabled BOOLEAN DEFAULT FALSE;

-- Add indexes for performance
CREATE INDEX idx_circle_memberships_disabled ON circle_memberships(is_disabled_member);
CREATE INDEX idx_circle_badges_disabled ON circle_badges(is_disabled);
