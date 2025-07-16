
CREATE TABLE parent_child_relations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_email TEXT NOT NULL,
  approval_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE parent_child_relations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_parent_child_relations_modtime 
  BEFORE UPDATE ON parent_child_relations 
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
