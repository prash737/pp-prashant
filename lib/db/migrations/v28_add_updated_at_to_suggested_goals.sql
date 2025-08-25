
-- Add updated_at column to suggested_goals table
ALTER TABLE suggested_goals 
ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to auto-update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to suggested_goals table
DROP TRIGGER IF EXISTS update_suggested_goals_updated_at ON suggested_goals;
CREATE TRIGGER update_suggested_goals_updated_at
  BEFORE UPDATE ON suggested_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
