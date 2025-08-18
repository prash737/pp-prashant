
-- Create suggested_goals table
CREATE TABLE suggested_goals (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  timeframe TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE suggested_goals ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy
CREATE POLICY "Suggested goals are viewable by everyone" ON suggested_goals FOR SELECT USING (true);
CREATE POLICY "Suggested goals can be inserted by authenticated users" ON suggested_goals FOR INSERT WITH CHECK (true);
