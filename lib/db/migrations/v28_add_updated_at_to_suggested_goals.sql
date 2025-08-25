
-- Add updatedAt column to suggested_goals table
ALTER TABLE suggested_goals 
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL;

-- Update existing records to have updated_at set to created_at
UPDATE suggested_goals 
SET updated_at = created_at 
WHERE updated_at IS NULL;
