
-- Create circle_badges table for custom user-created circles
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

-- Create circle_memberships table for managing who is in which circle
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

-- Create circle_invitations table for managing invitations to circles
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

-- Add RLS policies
ALTER TABLE circle_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_invitations ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can view circles they created or are members of" ON circle_badges FOR SELECT USING (
  creator_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM circle_memberships WHERE circle_id = id AND user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Users can create their own circles" ON circle_badges FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own circles" ON circle_badges FOR UPDATE USING (creator_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_circle_badges_modtime
BEFORE UPDATE ON circle_badges
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_circle_memberships_modtime
BEFORE UPDATE ON circle_memberships
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_circle_invitations_modtime
BEFORE UPDATE ON circle_invitations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create indexes for better performance
CREATE INDEX idx_circle_badges_creator_id ON circle_badges(creator_id);
CREATE INDEX idx_circle_memberships_circle_id ON circle_memberships(circle_id);
CREATE INDEX idx_circle_memberships_user_id ON circle_memberships(user_id);
CREATE INDEX idx_circle_invitations_circle_id ON circle_invitations(circle_id);
CREATE INDEX idx_circle_invitations_invitee_id ON circle_invitations(invitee_id);
