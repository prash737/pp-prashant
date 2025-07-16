
-- Migration v8: Create institution categories, types and student education history

-- Create institution categories table
CREATE TABLE institution_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create institution types table  
CREATE TABLE institution_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES institution_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  UNIQUE(category_id, slug)
);

-- Create student education history table
CREATE TABLE student_education_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institution_profiles(id),
  institution_name TEXT NOT NULL,
  institution_type_id UUID REFERENCES institution_types(id),
  degree_program TEXT,
  field_of_study TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  grade_level TEXT,
  gpa TEXT,
  achievements TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key to institution_profiles for institution_type_id
ALTER TABLE institution_profiles ADD COLUMN institution_type_id UUID REFERENCES institution_types(id);

-- Enable RLS
ALTER TABLE institution_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_education_history ENABLE ROW LEVEL SECURITY;

-- Add triggers for updated_at
CREATE TRIGGER update_institution_categories_modtime
BEFORE UPDATE ON institution_categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_institution_types_modtime
BEFORE UPDATE ON institution_types
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_student_education_history_modtime
BEFORE UPDATE ON student_education_history
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create RLS policies
CREATE POLICY "Institution categories are viewable by everyone" ON institution_categories FOR SELECT USING (true);
CREATE POLICY "Institution types are viewable by everyone" ON institution_types FOR SELECT USING (true);
CREATE POLICY "Students can view all education history" ON student_education_history FOR SELECT USING (true);
CREATE POLICY "Students can insert own education history" ON student_education_history FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own education history" ON student_education_history FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Students can delete own education history" ON student_education_history FOR DELETE USING (auth.uid() = student_id);
