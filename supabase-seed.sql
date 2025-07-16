
-- Supabase Seed Script for Interests and Skills
-- Run this directly in the Supabase SQL editor

-- Drop existing tables and their dependencies first
DROP TABLE IF EXISTS user_interests CASCADE;
DROP TABLE IF EXISTS user_skills CASCADE;
DROP TABLE IF EXISTS interests CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS interest_categories CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;

-- Create interest_categories table with integer ID
CREATE TABLE interest_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interests table with foreign key to interest_categories
CREATE TABLE interests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES interest_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skill_categories table with integer ID
CREATE TABLE skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table with foreign key to skill_categories
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_interests_category_id ON interests(category_id);
CREATE INDEX idx_skills_category_id ON skills(category_id);
CREATE INDEX idx_interest_categories_age_group ON interest_categories(age_group);
CREATE INDEX idx_skill_categories_age_group ON skill_categories(age_group);

-- Use DO block to properly handle foreign key relationships
DO $$
DECLARE
  -- Early Childhood Interest Category IDs
  fun_activities_id INTEGER;
  learning_topics_id INTEGER;
  outdoor_activities_id INTEGER;
  
  -- Elementary Interest Category IDs
  school_subjects_id INTEGER;
  fun_games_id INTEGER;
  creative_activities_id INTEGER;
  science_discovery_id INTEGER;
  
  -- Middle School Interest Category IDs
  ms_academic_subjects_id INTEGER;
  sports_activities_id INTEGER;
  ms_creative_arts_id INTEGER;
  ms_technology_id INTEGER;
  social_community_id INTEGER;
  
  -- High School Interest Category IDs
  hs_academic_subjects_id INTEGER;
  hs_arts_creativity_id INTEGER;
  hs_technology_id INTEGER;
  career_exploration_id INTEGER;
  social_impact_id INTEGER;
  
  -- Young Adult Interest Category IDs
  ya_academic_subjects_id INTEGER;
  ya_arts_creativity_id INTEGER;
  ya_technology_id INTEGER;
  career_fields_id INTEGER;
  personal_development_id INTEGER;
  
  -- Early Childhood Skill Category IDs
  basic_skills_id INTEGER;
  ec_social_skills_id INTEGER;
  ec_physical_skills_id INTEGER;
  
  -- Elementary Skill Category IDs
  elem_academic_skills_id INTEGER;
  elem_creative_skills_id INTEGER;
  elem_physical_skills_id INTEGER;
  elem_technology_skills_id INTEGER;
  elem_life_skills_id INTEGER;
  
  -- Middle School Skill Category IDs
  ms_academic_skills_id INTEGER;
  ms_technology_skills_id INTEGER;
  ms_creative_skills_id INTEGER;
  ms_social_skills_id INTEGER;
  ms_life_skills_id INTEGER;
  
  -- High School Skill Category IDs
  hs_academic_skills_id INTEGER;
  hs_technology_skills_id INTEGER;
  career_skills_id INTEGER;
  hs_life_skills_id INTEGER;
  hs_social_skills_id INTEGER;
  
  -- Young Adult Skill Category IDs
  technical_skills_id INTEGER;
  language_skills_id INTEGER;
  soft_skills_id INTEGER;
  ya_academic_skills_id INTEGER;
  professional_skills_id INTEGER;
BEGIN

-- Insert Interest Categories and get their IDs

-- Early Childhood Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES ('Fun Activities', 'early_childhood') RETURNING id INTO fun_activities_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Learning Topics', 'early_childhood') RETURNING id INTO learning_topics_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Outdoor Activities', 'early_childhood') RETURNING id INTO outdoor_activities_id;

-- Early Childhood Interests
INSERT INTO interests (name, category_id) VALUES 
('Drawing', fun_activities_id),
('Coloring', fun_activities_id),
('Singing', fun_activities_id),
('Dancing', fun_activities_id),
('Storytelling', fun_activities_id),
('Playing with Toys', fun_activities_id),
('Building Blocks', fun_activities_id),
('Pretend Play', fun_activities_id);

INSERT INTO interests (name, category_id) VALUES 
('Animals', learning_topics_id),
('Dinosaurs', learning_topics_id),
('Space', learning_topics_id),
('Nature', learning_topics_id),
('Shapes', learning_topics_id),
('Colors', learning_topics_id),
('Numbers', learning_topics_id),
('Letters', learning_topics_id),
('Music', learning_topics_id);

INSERT INTO interests (name, category_id) VALUES 
('Playing Outside', outdoor_activities_id),
('Playground', outdoor_activities_id),
('Swimming', outdoor_activities_id),
('Running', outdoor_activities_id),
('Ball Games', outdoor_activities_id),
('Nature Walks', outdoor_activities_id),
('Gardening', outdoor_activities_id);

-- Elementary Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES ('School Subjects', 'elementary') RETURNING id INTO school_subjects_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Fun & Games', 'elementary') RETURNING id INTO fun_games_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Creative Activities', 'elementary') RETURNING id INTO creative_activities_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Science & Discovery', 'elementary') RETURNING id INTO science_discovery_id;

-- Elementary Interests
INSERT INTO interests (name, category_id) VALUES 
('Reading', school_subjects_id),
('Writing', school_subjects_id),
('Math', school_subjects_id),
('Science', school_subjects_id),
('Art', school_subjects_id),
('Music', school_subjects_id),
('Physical Education', school_subjects_id),
('Social Studies', school_subjects_id);

INSERT INTO interests (name, category_id) VALUES 
('Board Games', fun_games_id),
('Card Games', fun_games_id),
('Video Games', fun_games_id),
('Puzzles', fun_games_id),
('Sports', fun_games_id),
('Crafts', fun_games_id),
('Collecting', fun_games_id),
('Building Models', fun_games_id);

INSERT INTO interests (name, category_id) VALUES 
('Drawing', creative_activities_id),
('Painting', creative_activities_id),
('Crafting', creative_activities_id),
('Singing', creative_activities_id),
('Dancing', creative_activities_id),
('Acting', creative_activities_id),
('Storytelling', creative_activities_id),
('Photography', creative_activities_id);

INSERT INTO interests (name, category_id) VALUES 
('Animals', science_discovery_id),
('Plants', science_discovery_id),
('Space', science_discovery_id),
('Dinosaurs', science_discovery_id),
('Robots', science_discovery_id),
('Experiments', science_discovery_id),
('Nature', science_discovery_id),
('Weather', science_discovery_id),
('Oceans', science_discovery_id);

-- Middle School Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES ('Academic Subjects', 'middle_school') RETURNING id INTO ms_academic_subjects_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Sports & Activities', 'middle_school') RETURNING id INTO sports_activities_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Creative Arts', 'middle_school') RETURNING id INTO ms_creative_arts_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Technology', 'middle_school') RETURNING id INTO ms_technology_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Social & Community', 'middle_school') RETURNING id INTO social_community_id;

-- Middle School Interests
INSERT INTO interests (name, category_id) VALUES 
('Math', ms_academic_subjects_id),
('Science', ms_academic_subjects_id),
('Language Arts', ms_academic_subjects_id),
('Social Studies', ms_academic_subjects_id),
('Foreign Languages', ms_academic_subjects_id),
('Computer Science', ms_academic_subjects_id),
('Art', ms_academic_subjects_id),
('Music', ms_academic_subjects_id);

INSERT INTO interests (name, category_id) VALUES 
('Team Sports', sports_activities_id),
('Individual Sports', sports_activities_id),
('Martial Arts', sports_activities_id),
('Dance', sports_activities_id),
('Swimming', sports_activities_id),
('Running', sports_activities_id),
('Cycling', sports_activities_id),
('Skateboarding', sports_activities_id);

INSERT INTO interests (name, category_id) VALUES 
('Drawing', ms_creative_arts_id),
('Painting', ms_creative_arts_id),
('Digital Art', ms_creative_arts_id),
('Photography', ms_creative_arts_id),
('Video Creation', ms_creative_arts_id),
('Music Production', ms_creative_arts_id),
('Creative Writing', ms_creative_arts_id),
('Drama', ms_creative_arts_id);

INSERT INTO interests (name, category_id) VALUES 
('Coding', ms_technology_id),
('Robotics', ms_technology_id),
('Game Design', ms_technology_id),
('3D Printing', ms_technology_id),
('Animation', ms_technology_id),
('Web Design', ms_technology_id),
('App Development', ms_technology_id),
('Digital Media', ms_technology_id);

INSERT INTO interests (name, category_id) VALUES 
('Volunteering', social_community_id),
('Environmental Projects', social_community_id),
('Student Government', social_community_id),
('Debate Club', social_community_id),
('School Newspaper', social_community_id),
('Community Service', social_community_id);

-- High School Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES ('Academic Subjects', 'high_school') RETURNING id INTO hs_academic_subjects_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Arts & Creativity', 'high_school') RETURNING id INTO hs_arts_creativity_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Technology', 'high_school') RETURNING id INTO hs_technology_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Career Exploration', 'high_school') RETURNING id INTO career_exploration_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Social Impact', 'high_school') RETURNING id INTO social_impact_id;

-- High School Interests
INSERT INTO interests (name, category_id) VALUES 
('Mathematics', hs_academic_subjects_id),
('Physics', hs_academic_subjects_id),
('Chemistry', hs_academic_subjects_id),
('Biology', hs_academic_subjects_id),
('Literature', hs_academic_subjects_id),
('History', hs_academic_subjects_id),
('Geography', hs_academic_subjects_id),
('Economics', hs_academic_subjects_id),
('Psychology', hs_academic_subjects_id),
('Computer Science', hs_academic_subjects_id);

INSERT INTO interests (name, category_id) VALUES 
('Visual Arts', hs_arts_creativity_id),
('Music', hs_arts_creativity_id),
('Theater', hs_arts_creativity_id),
('Film Production', hs_arts_creativity_id),
('Creative Writing', hs_arts_creativity_id),
('Photography', hs_arts_creativity_id),
('Digital Design', hs_arts_creativity_id),
('Fashion Design', hs_arts_creativity_id);

INSERT INTO interests (name, category_id) VALUES 
('Programming', hs_technology_id),
('Web Development', hs_technology_id),
('App Development', hs_technology_id),
('Robotics', hs_technology_id),
('Artificial Intelligence', hs_technology_id),
('Game Development', hs_technology_id),
('Cybersecurity', hs_technology_id),
('Data Science', hs_technology_id);

INSERT INTO interests (name, category_id) VALUES 
('Business', career_exploration_id),
('Engineering', career_exploration_id),
('Medicine', career_exploration_id),
('Law', career_exploration_id),
('Education', career_exploration_id),
('Journalism', career_exploration_id),
('Marketing', career_exploration_id),
('Finance', career_exploration_id),
('Architecture', career_exploration_id);

INSERT INTO interests (name, category_id) VALUES 
('Environmental Activism', social_impact_id),
('Social Justice', social_impact_id),
('Community Service', social_impact_id),
('Political Engagement', social_impact_id),
('Global Issues', social_impact_id),
('Public Speaking', social_impact_id),
('Leadership', social_impact_id);

-- Young Adult Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES ('Academic Subjects', 'young_adult') RETURNING id INTO ya_academic_subjects_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Arts & Creativity', 'young_adult') RETURNING id INTO ya_arts_creativity_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Technology', 'young_adult') RETURNING id INTO ya_technology_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Career Fields', 'young_adult') RETURNING id INTO career_fields_id;
INSERT INTO interest_categories (name, age_group) VALUES ('Personal Development', 'young_adult') RETURNING id INTO personal_development_id;

-- Young Adult Interests
INSERT INTO interests (name, category_id) VALUES 
('Mathematics', ya_academic_subjects_id),
('Physics', ya_academic_subjects_id),
('Chemistry', ya_academic_subjects_id),
('Biology', ya_academic_subjects_id),
('Computer Science', ya_academic_subjects_id),
('Literature', ya_academic_subjects_id),
('History', ya_academic_subjects_id),
('Geography', ya_academic_subjects_id),
('Economics', ya_academic_subjects_id),
('Psychology', ya_academic_subjects_id);

INSERT INTO interests (name, category_id) VALUES 
('Drawing', ya_arts_creativity_id),
('Painting', ya_arts_creativity_id),
('Photography', ya_arts_creativity_id),
('Music', ya_arts_creativity_id),
('Dance', ya_arts_creativity_id),
('Theater', ya_arts_creativity_id),
('Creative Writing', ya_arts_creativity_id),
('Film Making', ya_arts_creativity_id),
('Design', ya_arts_creativity_id),
('Crafts', ya_arts_creativity_id);

INSERT INTO interests (name, category_id) VALUES 
('Programming', ya_technology_id),
('Web Development', ya_technology_id),
('Mobile Apps', ya_technology_id),
('Artificial Intelligence', ya_technology_id),
('Robotics', ya_technology_id),
('Game Development', ya_technology_id),
('Cybersecurity', ya_technology_id),
('Data Science', ya_technology_id),
('Virtual Reality', ya_technology_id),
('Blockchain', ya_technology_id);

INSERT INTO interests (name, category_id) VALUES 
('Medicine', career_fields_id),
('Engineering', career_fields_id),
('Law', career_fields_id),
('Business', career_fields_id),
('Education', career_fields_id),
('Research', career_fields_id),
('Social Work', career_fields_id),
('Environmental Science', career_fields_id),
('Journalism', career_fields_id),
('Architecture', career_fields_id);

INSERT INTO interests (name, category_id) VALUES 
('Entrepreneurship', personal_development_id),
('Leadership', personal_development_id),
('Public Speaking', personal_development_id),
('Financial Literacy', personal_development_id),
('Productivity', personal_development_id),
('Mindfulness', personal_development_id),
('Fitness', personal_development_id),
('Nutrition', personal_development_id),
('Travel', personal_development_id),
('Languages', personal_development_id);

-- Insert Skill Categories and Skills

-- Early Childhood Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES ('Basic Skills', 'early_childhood') RETURNING id INTO basic_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Social Skills', 'early_childhood') RETURNING id INTO ec_social_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Physical Skills', 'early_childhood') RETURNING id INTO ec_physical_skills_id;

-- Early Childhood Skills
INSERT INTO skills (name, category_id) VALUES 
('Counting', basic_skills_id),
('Recognizing Letters', basic_skills_id),
('Recognizing Colors', basic_skills_id),
('Recognizing Shapes', basic_skills_id),
('Drawing', basic_skills_id),
('Coloring', basic_skills_id),
('Cutting with Scissors', basic_skills_id),
('Following Instructions', basic_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Sharing', ec_social_skills_id),
('Taking Turns', ec_social_skills_id),
('Listening', ec_social_skills_id),
('Using Manners', ec_social_skills_id),
('Making Friends', ec_social_skills_id),
('Expressing Feelings', ec_social_skills_id),
('Working Together', ec_social_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Running', ec_physical_skills_id),
('Jumping', ec_physical_skills_id),
('Throwing', ec_physical_skills_id),
('Catching', ec_physical_skills_id),
('Balancing', ec_physical_skills_id),
('Climbing', ec_physical_skills_id),
('Dancing', ec_physical_skills_id),
('Riding a Tricycle', ec_physical_skills_id);

-- Elementary Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES ('Academic Skills', 'elementary') RETURNING id INTO elem_academic_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Creative Skills', 'elementary') RETURNING id INTO elem_creative_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Physical Skills', 'elementary') RETURNING id INTO elem_physical_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Technology Skills', 'elementary') RETURNING id INTO elem_technology_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Life Skills', 'elementary') RETURNING id INTO elem_life_skills_id;

-- Elementary Skills
INSERT INTO skills (name, category_id) VALUES 
('Reading', elem_academic_skills_id),
('Writing', elem_academic_skills_id),
('Basic Math', elem_academic_skills_id),
('Spelling', elem_academic_skills_id),
('Telling Time', elem_academic_skills_id),
('Using a Calendar', elem_academic_skills_id),
('Basic Science', elem_academic_skills_id),
('Geography', elem_academic_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Drawing', elem_creative_skills_id),
('Painting', elem_creative_skills_id),
('Crafting', elem_creative_skills_id),
('Singing', elem_creative_skills_id),
('Playing an Instrument', elem_creative_skills_id),
('Acting', elem_creative_skills_id),
('Storytelling', elem_creative_skills_id),
('Dancing', elem_creative_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Running', elem_physical_skills_id),
('Swimming', elem_physical_skills_id),
('Biking', elem_physical_skills_id),
('Ball Sports', elem_physical_skills_id),
('Gymnastics', elem_physical_skills_id),
('Martial Arts', elem_physical_skills_id),
('Skating', elem_physical_skills_id),
('Jumping Rope', elem_physical_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Using a Computer', elem_technology_skills_id),
('Basic Typing', elem_technology_skills_id),
('Internet Safety', elem_technology_skills_id),
('Educational Games', elem_technology_skills_id),
('Basic Coding', elem_technology_skills_id),
('Digital Art', elem_technology_skills_id),
('Taking Photos', elem_technology_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Organization', elem_life_skills_id),
('Following Directions', elem_life_skills_id),
('Completing Homework', elem_life_skills_id),
('Basic Cooking', elem_life_skills_id),
('Cleaning Up', elem_life_skills_id),
('Pet Care', elem_life_skills_id),
('Plant Care', elem_life_skills_id),
('Money Basics', elem_life_skills_id);

-- Middle School Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES ('Academic Skills', 'middle_school') RETURNING id INTO ms_academic_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Technology Skills', 'middle_school') RETURNING id INTO ms_technology_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Creative Skills', 'middle_school') RETURNING id INTO ms_creative_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Social Skills', 'middle_school') RETURNING id INTO ms_social_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Life Skills', 'middle_school') RETURNING id INTO ms_life_skills_id;

-- Middle School Skills
INSERT INTO skills (name, category_id) VALUES 
('Essay Writing', ms_academic_skills_id),
('Research', ms_academic_skills_id),
('Pre-Algebra', ms_academic_skills_id),
('Science Projects', ms_academic_skills_id),
('Critical Reading', ms_academic_skills_id),
('Note Taking', ms_academic_skills_id),
('Study Skills', ms_academic_skills_id),
('Presentations', ms_academic_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Typing', ms_technology_skills_id),
('Digital Research', ms_technology_skills_id),
('Basic Coding', ms_technology_skills_id),
('Presentation Software', ms_technology_skills_id),
('Word Processing', ms_technology_skills_id),
('Spreadsheets', ms_technology_skills_id),
('Digital Safety', ms_technology_skills_id),
('Video Editing', ms_technology_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Drawing', ms_creative_skills_id),
('Painting', ms_creative_skills_id),
('Digital Art', ms_creative_skills_id),
('Photography', ms_creative_skills_id),
('Creative Writing', ms_creative_skills_id),
('Music Performance', ms_creative_skills_id),
('Drama', ms_creative_skills_id),
('Crafting', ms_creative_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Communication', ms_social_skills_id),
('Teamwork', ms_social_skills_id),
('Conflict Resolution', ms_social_skills_id),
('Active Listening', ms_social_skills_id),
('Public Speaking', ms_social_skills_id),
('Leadership', ms_social_skills_id),
('Empathy', ms_social_skills_id),
('Cultural Awareness', ms_social_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Organization', ms_life_skills_id),
('Time Management', ms_life_skills_id),
('Goal Setting', ms_life_skills_id),
('Basic Cooking', ms_life_skills_id),
('Money Management', ms_life_skills_id),
('Self-Care', ms_life_skills_id),
('First Aid', ms_life_skills_id),
('Problem Solving', ms_life_skills_id);

-- High School Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES ('Academic Skills', 'high_school') RETURNING id INTO hs_academic_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Technology Skills', 'high_school') RETURNING id INTO hs_technology_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Career Skills', 'high_school') RETURNING id INTO career_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Life Skills', 'high_school') RETURNING id INTO hs_life_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Social Skills', 'high_school') RETURNING id INTO hs_social_skills_id;

-- High School Skills
INSERT INTO skills (name, category_id) VALUES 
('Advanced Writing', hs_academic_skills_id),
('Research Methods', hs_academic_skills_id),
('Algebra', hs_academic_skills_id),
('Geometry', hs_academic_skills_id),
('Chemistry', hs_academic_skills_id),
('Physics', hs_academic_skills_id),
('Literary Analysis', hs_academic_skills_id),
('Critical Thinking', hs_academic_skills_id),
('Foreign Language', hs_academic_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Programming', hs_technology_skills_id),
('Web Design', hs_technology_skills_id),
('Data Analysis', hs_technology_skills_id),
('Digital Media', hs_technology_skills_id),
('Computer Applications', hs_technology_skills_id),
('Information Literacy', hs_technology_skills_id),
('Cybersecurity Basics', hs_technology_skills_id),
('3D Modeling', hs_technology_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Resume Writing', career_skills_id),
('Interview Skills', career_skills_id),
('Professional Communication', career_skills_id),
('Networking', career_skills_id),
('Project Management', career_skills_id),
('Leadership', career_skills_id),
('Public Speaking', career_skills_id),
('Entrepreneurship', career_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Financial Literacy', hs_life_skills_id),
('Time Management', hs_life_skills_id),
('Goal Setting', hs_life_skills_id),
('Decision Making', hs_life_skills_id),
('Stress Management', hs_life_skills_id),
('Healthy Habits', hs_life_skills_id),
('Cooking', hs_life_skills_id),
('Basic Car Maintenance', hs_life_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Collaboration', hs_social_skills_id),
('Conflict Resolution', hs_social_skills_id),
('Cultural Competence', hs_social_skills_id),
('Emotional Intelligence', hs_social_skills_id),
('Mentoring', hs_social_skills_id),
('Community Engagement', hs_social_skills_id),
('Negotiation', hs_social_skills_id),
('Relationship Building', hs_social_skills_id);

-- Young Adult Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES ('Technical Skills', 'young_adult') RETURNING id INTO technical_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Language Skills', 'young_adult') RETURNING id INTO language_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Soft Skills', 'young_adult') RETURNING id INTO soft_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Academic Skills', 'young_adult') RETURNING id INTO ya_academic_skills_id;
INSERT INTO skill_categories (name, age_group) VALUES ('Professional Skills', 'young_adult') RETURNING id INTO professional_skills_id;

-- Young Adult Skills
INSERT INTO skills (name, category_id) VALUES 
('Programming', technical_skills_id),
('Web Development', technical_skills_id),
('Data Analysis', technical_skills_id),
('Graphic Design', technical_skills_id),
('Video Editing', technical_skills_id),
('3D Modeling', technical_skills_id),
('Mobile App Development', technical_skills_id),
('Database Management', technical_skills_id),
('Network Administration', technical_skills_id),
('Cybersecurity', technical_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('English', language_skills_id),
('Spanish', language_skills_id),
('French', language_skills_id),
('German', language_skills_id),
('Chinese', language_skills_id),
('Japanese', language_skills_id),
('Russian', language_skills_id),
('Arabic', language_skills_id),
('Portuguese', language_skills_id),
('Italian', language_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Communication', soft_skills_id),
('Leadership', soft_skills_id),
('Teamwork', soft_skills_id),
('Problem Solving', soft_skills_id),
('Critical Thinking', soft_skills_id),
('Time Management', soft_skills_id),
('Adaptability', soft_skills_id),
('Creativity', soft_skills_id),
('Emotional Intelligence', soft_skills_id),
('Conflict Resolution', soft_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Research', ya_academic_skills_id),
('Writing', ya_academic_skills_id),
('Public Speaking', ya_academic_skills_id),
('Mathematical Reasoning', ya_academic_skills_id),
('Scientific Method', ya_academic_skills_id),
('Literary Analysis', ya_academic_skills_id),
('Historical Analysis', ya_academic_skills_id),
('Statistical Analysis', ya_academic_skills_id),
('Laboratory Techniques', ya_academic_skills_id),
('Academic Writing', ya_academic_skills_id);

INSERT INTO skills (name, category_id) VALUES 
('Project Management', professional_skills_id),
('Strategic Planning', professional_skills_id),
('Financial Analysis', professional_skills_id),
('Marketing', professional_skills_id),
('Sales', professional_skills_id),
('Customer Service', professional_skills_id),
('Negotiation', professional_skills_id),
('Presentation', professional_skills_id),
('Networking', professional_skills_id),
('Mentoring', professional_skills_id);

END $$;

-- Display summary
SELECT 
  'Interest Categories' as type,
  COUNT(*) as count,
  age_group
FROM interest_categories 
GROUP BY age_group
UNION ALL
SELECT 
  'Interests' as type,
  COUNT(*) as count,
  ic.age_group
FROM interests i
JOIN interest_categories ic ON i.category_id = ic.id
GROUP BY ic.age_group
UNION ALL
SELECT 
  'Skill Categories' as type,
  COUNT(*) as count,
  age_group
FROM skill_categories 
GROUP BY age_group
UNION ALL
SELECT 
  'Skills' as type,
  COUNT(*) as count,
  sc.age_group
FROM skills s
JOIN skill_categories sc ON s.category_id = sc.id
GROUP BY sc.age_group
ORDER BY type, age_group;
