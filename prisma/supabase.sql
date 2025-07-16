
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to read all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Similar policies for student_profiles
CREATE POLICY "Students can insert their own profile"
ON student_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Student profiles are viewable by everyone"
ON student_profiles FOR SELECT
USING (true);

CREATE POLICY "Students can update own profile"
ON student_profiles FOR UPDATE
USING (auth.uid() = id);
