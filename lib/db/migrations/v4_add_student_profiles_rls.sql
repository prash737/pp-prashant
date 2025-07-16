
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles table
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
ON profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);

-- Enable RLS on student_profiles table
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_profiles table
CREATE POLICY "Users can insert their own student profile"
ON student_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all student profiles"
ON student_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own student profile"
ON student_profiles
FOR UPDATE
USING (auth.uid() = id);
