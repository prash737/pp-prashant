
-- Migration v14: Convert institution category and type IDs from UUID to incremental integers

-- First, let's create new tables with integer IDs
CREATE TABLE institution_categories_new (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE institution_types_new (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES institution_categories_new(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, slug)
);

-- Migrate data from old tables to new tables (preserving order by creation date)
INSERT INTO institution_categories_new (name, slug, description, created_at, updated_at)
SELECT name, slug, description, created_at, updated_at 
FROM institution_categories 
ORDER BY created_at;

-- Create a mapping table to help with foreign key updates
CREATE TEMP TABLE category_id_mapping AS
SELECT 
  old.id as old_id,
  new.id as new_id,
  old.name
FROM institution_categories old
JOIN institution_categories_new new ON old.name = new.name;

-- Migrate institution types with proper category mapping
INSERT INTO institution_types_new (category_id, name, slug, description, created_at, updated_at)
SELECT 
  mapping.new_id as category_id,
  it.name,
  it.slug,
  it.description,
  it.created_at,
  it.updated_at
FROM institution_types it
JOIN category_id_mapping mapping ON it.category_id = mapping.old_id
ORDER BY it.created_at;

-- Create mapping for institution types
CREATE TEMP TABLE type_id_mapping AS
SELECT 
  old.id as old_id,
  new.id as new_id,
  old.name,
  old.slug
FROM institution_types old
JOIN institution_types_new new ON old.name = new.name AND old.slug = new.slug;

-- Update foreign key references in other tables
-- First, add new integer columns
ALTER TABLE institution_profiles ADD COLUMN institution_type_id_new INTEGER;
ALTER TABLE student_education_history ADD COLUMN institution_type_id_new INTEGER;

-- Update the references using the mapping
UPDATE institution_profiles 
SET institution_type_id_new = mapping.new_id
FROM type_id_mapping mapping
WHERE institution_profiles.institution_type_id = mapping.old_id;

UPDATE student_education_history 
SET institution_type_id_new = mapping.new_id
FROM type_id_mapping mapping
WHERE student_education_history.institution_type_id = mapping.old_id;

-- Drop the old foreign key constraints
ALTER TABLE institution_profiles DROP CONSTRAINT IF EXISTS institution_profiles_institution_type_id_fkey;
ALTER TABLE student_education_history DROP CONSTRAINT IF EXISTS student_education_history_institution_type_id_fkey;

-- Drop old columns and rename new ones
ALTER TABLE institution_profiles DROP COLUMN institution_type_id;
ALTER TABLE institution_profiles RENAME COLUMN institution_type_id_new TO institution_type_id;

ALTER TABLE student_education_history DROP COLUMN institution_type_id;
ALTER TABLE student_education_history RENAME COLUMN institution_type_id_new TO institution_type_id;

-- Drop old tables
DROP TABLE institution_types;
DROP TABLE institution_categories;

-- Rename new tables
ALTER TABLE institution_categories_new RENAME TO institution_categories;
ALTER TABLE institution_types_new RENAME TO institution_types;

-- Add back foreign key constraints
ALTER TABLE institution_profiles 
ADD CONSTRAINT institution_profiles_institution_type_id_fkey 
FOREIGN KEY (institution_type_id) REFERENCES institution_types(id);

ALTER TABLE student_education_history 
ADD CONSTRAINT student_education_history_institution_type_id_fkey 
FOREIGN KEY (institution_type_id) REFERENCES institution_types(id);

-- Clean up temp tables
DROP TABLE category_id_mapping;
DROP TABLE type_id_mapping;

-- Verify the migration
SELECT 'Categories count:' as info, COUNT(*) as count FROM institution_categories
UNION ALL
SELECT 'Types count:' as info, COUNT(*) as count FROM institution_types;
