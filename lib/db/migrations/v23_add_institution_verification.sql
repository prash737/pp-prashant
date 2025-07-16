
-- Migration v23: Add institution verification to student education history

-- Add institution_verified column to student_education_history
ALTER TABLE student_education_history 
ADD COLUMN institution_verified BOOLEAN DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN student_education_history.institution_verified IS 
'NULL = pending verification, TRUE = verified by institution, FALSE = rejected by institution';
