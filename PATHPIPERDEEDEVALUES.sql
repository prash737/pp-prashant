
-- Complete SQL INSERT commands for Interest Categories, Interests, Skill Categories, and Skills
-- For all age groups: early_childhood, elementary, middle_school, high_school, young_adult

-- =====================================================
-- INTEREST CATEGORIES AND INTERESTS
-- =====================================================

-- Early Childhood Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES
('Animals & Nature', 'early_childhood'),
('Arts & Crafts', 'early_childhood'),
('Stories & Books', 'early_childhood'),
('Music & Dance', 'early_childhood'),
('Toys & Games', 'early_childhood');

-- Early Childhood Interests
INSERT INTO interests (name, category_id) VALUES
-- Animals & Nature (Category ID will be auto-assigned)
('Pet Care', (SELECT id FROM interest_categories WHERE name = 'Animals & Nature' AND age_group = 'early_childhood')),
('Zoo Animals', (SELECT id FROM interest_categories WHERE name = 'Animals & Nature' AND age_group = 'early_childhood')),
('Farm Animals', (SELECT id FROM interest_categories WHERE name = 'Animals & Nature' AND age_group = 'early_childhood')),
('Insects & Bugs', (SELECT id FROM interest_categories WHERE name = 'Animals & Nature' AND age_group = 'early_childhood')),
('Plants & Flowers', (SELECT id FROM interest_categories WHERE name = 'Animals & Nature' AND age_group = 'early_childhood')),

-- Arts & Crafts
('Finger Painting', (SELECT id FROM interest_categories WHERE name = 'Arts & Crafts' AND age_group = 'early_childhood')),
('Play Dough', (SELECT id FROM interest_categories WHERE name = 'Arts & Crafts' AND age_group = 'early_childhood')),
('Simple Crafts', (SELECT id FROM interest_categories WHERE name = 'Arts & Crafts' AND age_group = 'early_childhood')),
('Coloring Books', (SELECT id FROM interest_categories WHERE name = 'Arts & Crafts' AND age_group = 'early_childhood')),
('Sticker Activities', (SELECT id FROM interest_categories WHERE name = 'Arts & Crafts' AND age_group = 'early_childhood')),

-- Stories & Books
('Picture Books', (SELECT id FROM interest_categories WHERE name = 'Stories & Books' AND age_group = 'early_childhood')),
('Fairy Tales', (SELECT id FROM interest_categories WHERE name = 'Stories & Books' AND age_group = 'early_childhood')),
('Bedtime Stories', (SELECT id FROM interest_categories WHERE name = 'Stories & Books' AND age_group = 'early_childhood')),
('Interactive Books', (SELECT id FROM interest_categories WHERE name = 'Stories & Books' AND age_group = 'early_childhood')),
('Nursery Rhymes', (SELECT id FROM interest_categories WHERE name = 'Stories & Books' AND age_group = 'early_childhood')),

-- Music & Dance
('Singing', (SELECT id FROM interest_categories WHERE name = 'Music & Dance' AND age_group = 'early_childhood')),
('Dancing', (SELECT id FROM interest_categories WHERE name = 'Music & Dance' AND age_group = 'early_childhood')),
('Musical Instruments', (SELECT id FROM interest_categories WHERE name = 'Music & Dance' AND age_group = 'early_childhood')),
('Rhythm Games', (SELECT id FROM interest_categories WHERE name = 'Music & Dance' AND age_group = 'early_childhood')),
('Music Videos', (SELECT id FROM interest_categories WHERE name = 'Music & Dance' AND age_group = 'early_childhood')),

-- Toys & Games
('Building Blocks', (SELECT id FROM interest_categories WHERE name = 'Toys & Games' AND age_group = 'early_childhood')),
('Puzzles', (SELECT id FROM interest_categories WHERE name = 'Toys & Games' AND age_group = 'early_childhood')),
('Board Games', (SELECT id FROM interest_categories WHERE name = 'Toys & Games' AND age_group = 'early_childhood')),
('Role Playing', (SELECT id FROM interest_categories WHERE name = 'Toys & Games' AND age_group = 'early_childhood')),
('Outdoor Games', (SELECT id FROM interest_categories WHERE name = 'Toys & Games' AND age_group = 'early_childhood'));

-- Elementary Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES
('Science & Discovery', 'elementary'),
('Sports & Physical Activity', 'elementary'),
('Creative Arts', 'elementary'),
('Reading & Learning', 'elementary'),
('Technology & Games', 'elementary');

-- Elementary Interests
INSERT INTO interests (name, category_id) VALUES
-- Science & Discovery
('Dinosaurs', (SELECT id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary')),
('Space & Planets', (SELECT id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary')),
('Simple Experiments', (SELECT id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary')),
('Nature Walks', (SELECT id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary')),
('Weather & Seasons', (SELECT id FROM interest_categories WHERE name = 'Science & Discovery' AND age_group = 'elementary')),

-- Sports & Physical Activity
('Soccer', (SELECT id FROM interest_categories WHERE name = 'Sports & Physical Activity' AND age_group = 'elementary')),
('Basketball', (SELECT id FROM interest_categories WHERE name = 'Sports & Physical Activity' AND age_group = 'elementary')),
('Swimming', (SELECT id FROM interest_categories WHERE name = 'Sports & Physical Activity' AND age_group = 'elementary')),
('Cycling', (SELECT id FROM interest_categories WHERE name = 'Sports & Physical Activity' AND age_group = 'elementary')),
('Playground Games', (SELECT id FROM interest_categories WHERE name = 'Sports & Physical Activity' AND age_group = 'elementary')),

-- Creative Arts
('Drawing & Painting', (SELECT id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Music Lessons', (SELECT id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Dance Classes', (SELECT id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Drama & Theater', (SELECT id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Crafts & DIY', (SELECT id FROM interest_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),

-- Reading & Learning
('Adventure Books', (SELECT id FROM interest_categories WHERE name = 'Reading & Learning' AND age_group = 'elementary')),
('Educational Games', (SELECT id FROM interest_categories WHERE name = 'Reading & Learning' AND age_group = 'elementary')),
('History Stories', (SELECT id FROM interest_categories WHERE name = 'Reading & Learning' AND age_group = 'elementary')),
('Geography', (SELECT id FROM interest_categories WHERE name = 'Reading & Learning' AND age_group = 'elementary')),
('Math Puzzles', (SELECT id FROM interest_categories WHERE name = 'Reading & Learning' AND age_group = 'elementary')),

-- Technology & Games
('Educational Apps', (SELECT id FROM interest_categories WHERE name = 'Technology & Games' AND age_group = 'elementary')),
('Simple Programming', (SELECT id FROM interest_categories WHERE name = 'Technology & Games' AND age_group = 'elementary')),
('Video Games', (SELECT id FROM interest_categories WHERE name = 'Technology & Games' AND age_group = 'elementary')),
('Computer Skills', (SELECT id FROM interest_categories WHERE name = 'Technology & Games' AND age_group = 'elementary')),
('Digital Art', (SELECT id FROM interest_categories WHERE name = 'Technology & Games' AND age_group = 'elementary'));

-- Middle School Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES
('Academic Interests', 'middle_school'),
('Creative Expression', 'middle_school'),
('Sports & Activities', 'middle_school'),
('Technology & Innovation', 'middle_school'),
('Social & Community', 'middle_school');

-- Middle School Interests
INSERT INTO interests (name, category_id) VALUES
-- Academic Interests
('Advanced Science', (SELECT id FROM interest_categories WHERE name = 'Academic Interests' AND age_group = 'middle_school')),
('Mathematics', (SELECT id FROM interest_categories WHERE name = 'Academic Interests' AND age_group = 'middle_school')),
('Literature', (SELECT id FROM interest_categories WHERE name = 'Academic Interests' AND age_group = 'middle_school')),
('History', (SELECT id FROM interest_categories WHERE name = 'Academic Interests' AND age_group = 'middle_school')),
('Foreign Languages', (SELECT id FROM interest_categories WHERE name = 'Academic Interests' AND age_group = 'middle_school')),

-- Creative Expression
('Photography', (SELECT id FROM interest_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Video Making', (SELECT id FROM interest_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Music Production', (SELECT id FROM interest_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Writing', (SELECT id FROM interest_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Art & Design', (SELECT id FROM interest_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),

-- Sports & Activities
('Competitive Sports', (SELECT id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school')),
('Fitness & Health', (SELECT id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school')),
('Outdoor Adventures', (SELECT id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school')),
('Team Activities', (SELECT id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school')),
('Individual Sports', (SELECT id FROM interest_categories WHERE name = 'Sports & Activities' AND age_group = 'middle_school')),

-- Technology & Innovation
('Programming', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Robotics', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Web Development', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Gaming', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Digital Media', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),

-- Social & Community
('Volunteer Work', (SELECT id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school')),
('Club Activities', (SELECT id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school')),
('Peer Groups', (SELECT id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school')),
('Cultural Events', (SELECT id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school')),
('Community Service', (SELECT id FROM interest_categories WHERE name = 'Social & Community' AND age_group = 'middle_school'));

-- High School Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES
('Academic Excellence', 'high_school'),
('Career Exploration', 'high_school'),
('Creative & Artistic', 'high_school'),
('Technology & Engineering', 'high_school'),
('Leadership & Service', 'high_school');

-- High School Interests
INSERT INTO interests (name, category_id) VALUES
-- Academic Excellence
('STEM Fields', (SELECT id FROM interest_categories WHERE name = 'Academic Excellence' AND age_group = 'high_school')),
('Liberal Arts', (SELECT id FROM interest_categories WHERE name = 'Academic Excellence' AND age_group = 'high_school')),
('Research Projects', (SELECT id FROM interest_categories WHERE name = 'Academic Excellence' AND age_group = 'high_school')),
('Academic Competitions', (SELECT id FROM interest_categories WHERE name = 'Academic Excellence' AND age_group = 'high_school')),
('Advanced Courses', (SELECT id FROM interest_categories WHERE name = 'Academic Excellence' AND age_group = 'high_school')),

-- Career Exploration
('Internships', (SELECT id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school')),
('Job Shadowing', (SELECT id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school')),
('Career Fairs', (SELECT id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school')),
('Professional Skills', (SELECT id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school')),
('Industry Exposure', (SELECT id FROM interest_categories WHERE name = 'Career Exploration' AND age_group = 'high_school')),

-- Creative & Artistic
('Professional Arts', (SELECT id FROM interest_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Media Production', (SELECT id FROM interest_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Design & Architecture', (SELECT id FROM interest_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Performance Arts', (SELECT id FROM interest_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Creative Writing', (SELECT id FROM interest_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),

-- Technology & Engineering
('Advanced Programming', (SELECT id FROM interest_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Engineering Projects', (SELECT id FROM interest_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Tech Competitions', (SELECT id FROM interest_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Innovation Labs', (SELECT id FROM interest_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Startup Culture', (SELECT id FROM interest_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),

-- Leadership & Service
('Student Leadership', (SELECT id FROM interest_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Community Service', (SELECT id FROM interest_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Social Issues', (SELECT id FROM interest_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Global Awareness', (SELECT id FROM interest_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Civic Engagement', (SELECT id FROM interest_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school'));

-- Young Adult Interest Categories
INSERT INTO interest_categories (name, age_group) VALUES
('Professional Development', 'young_adult'),
('Higher Education', 'young_adult'),
('Creative Industries', 'young_adult'),
('Technology & Innovation', 'young_adult'),
('Personal Growth', 'young_adult');

-- Young Adult Interests
INSERT INTO interests (name, category_id) VALUES
-- Professional Development
('Career Advancement', (SELECT id FROM interest_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Industry Networking', (SELECT id FROM interest_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Professional Skills', (SELECT id FROM interest_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Leadership Development', (SELECT id FROM interest_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Entrepreneurship', (SELECT id FROM interest_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),

-- Higher Education
('University Studies', (SELECT id FROM interest_categories WHERE name = 'Higher Education' AND age_group = 'young_adult')),
('Research Opportunities', (SELECT id FROM interest_categories WHERE name = 'Higher Education' AND age_group = 'young_adult')),
('Academic Conferences', (SELECT id FROM interest_categories WHERE name = 'Higher Education' AND age_group = 'young_adult')),
('Specialized Training', (SELECT id FROM interest_categories WHERE name = 'Higher Education' AND age_group = 'young_adult')),
('Continuing Education', (SELECT id FROM interest_categories WHERE name = 'Higher Education' AND age_group = 'young_adult')),

-- Creative Industries
('Professional Arts', (SELECT id FROM interest_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Media & Entertainment', (SELECT id FROM interest_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Design & Innovation', (SELECT id FROM interest_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Content Creation', (SELECT id FROM interest_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Creative Business', (SELECT id FROM interest_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),

-- Technology & Innovation
('Emerging Technologies', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'young_adult')),
('Tech Startups', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'young_adult')),
('Innovation Labs', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'young_adult')),
('Digital Transformation', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'young_adult')),
('Future Tech', (SELECT id FROM interest_categories WHERE name = 'Technology & Innovation' AND age_group = 'young_adult')),

-- Personal Growth
('Personal Development', (SELECT id FROM interest_categories WHERE name = 'Personal Growth' AND age_group = 'young_adult')),
('Health & Wellness', (SELECT id FROM interest_categories WHERE name = 'Personal Growth' AND age_group = 'young_adult')),
('Travel & Culture', (SELECT id FROM interest_categories WHERE name = 'Personal Growth' AND age_group = 'young_adult')),
('Relationships', (SELECT id FROM interest_categories WHERE name = 'Personal Growth' AND age_group = 'young_adult')),
('Life Balance', (SELECT id FROM interest_categories WHERE name = 'Personal Growth' AND age_group = 'young_adult'));

-- =====================================================
-- SKILL CATEGORIES AND SKILLS
-- =====================================================

-- Early Childhood Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES
('Basic Motor Skills', 'early_childhood'),
('Language & Communication', 'early_childhood'),
('Social & Emotional', 'early_childhood'),
('Cognitive Skills', 'early_childhood');

-- Early Childhood Skills
INSERT INTO skills (name, category_id) VALUES
-- Basic Motor Skills
('Drawing & Coloring', (SELECT id FROM skill_categories WHERE name = 'Basic Motor Skills' AND age_group = 'early_childhood')),
('Cutting with Safety Scissors', (SELECT id FROM skill_categories WHERE name = 'Basic Motor Skills' AND age_group = 'early_childhood')),
('Building with Blocks', (SELECT id FROM skill_categories WHERE name = 'Basic Motor Skills' AND age_group = 'early_childhood')),
('Puzzle Solving', (SELECT id FROM skill_categories WHERE name = 'Basic Motor Skills' AND age_group = 'early_childhood')),
('Ball Skills (Throwing/Catching)', (SELECT id FROM skill_categories WHERE name = 'Basic Motor Skills' AND age_group = 'early_childhood')),

-- Language & Communication
('Alphabet Recognition', (SELECT id FROM skill_categories WHERE name = 'Language & Communication' AND age_group = 'early_childhood')),
('Phonics Basics', (SELECT id FROM skill_categories WHERE name = 'Language & Communication' AND age_group = 'early_childhood')),
('Story Telling', (SELECT id FROM skill_categories WHERE name = 'Language & Communication' AND age_group = 'early_childhood')),
('Vocabulary Building', (SELECT id FROM skill_categories WHERE name = 'Language & Communication' AND age_group = 'early_childhood')),
('Listening Skills', (SELECT id FROM skill_categories WHERE name = 'Language & Communication' AND age_group = 'early_childhood')),

-- Social & Emotional
('Sharing & Turn-Taking', (SELECT id FROM skill_categories WHERE name = 'Social & Emotional' AND age_group = 'early_childhood')),
('Following Instructions', (SELECT id FROM skill_categories WHERE name = 'Social & Emotional' AND age_group = 'early_childhood')),
('Expressing Feelings', (SELECT id FROM skill_categories WHERE name = 'Social & Emotional' AND age_group = 'early_childhood')),
('Making Friends', (SELECT id FROM skill_categories WHERE name = 'Social & Emotional' AND age_group = 'early_childhood')),
('Helping Others', (SELECT id FROM skill_categories WHERE name = 'Social & Emotional' AND age_group = 'early_childhood')),

-- Cognitive Skills
('Number Recognition', (SELECT id FROM skill_categories WHERE name = 'Cognitive Skills' AND age_group = 'early_childhood')),
('Shape & Color Identification', (SELECT id FROM skill_categories WHERE name = 'Cognitive Skills' AND age_group = 'early_childhood')),
('Pattern Recognition', (SELECT id FROM skill_categories WHERE name = 'Cognitive Skills' AND age_group = 'early_childhood')),
('Sorting & Categorizing', (SELECT id FROM skill_categories WHERE name = 'Cognitive Skills' AND age_group = 'early_childhood')),
('Memory Games', (SELECT id FROM skill_categories WHERE name = 'Cognitive Skills' AND age_group = 'early_childhood'));

-- Elementary Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES
('Academic Skills', 'elementary'),
('Creative Arts', 'elementary'),
('Physical Activities', 'elementary'),
('Technology', 'elementary'),
('Life Skills', 'elementary');

-- Elementary Skills
INSERT INTO skills (name, category_id) VALUES
-- Academic Skills
('Reading Comprehension', (SELECT id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary')),
('Basic Math (Addition/Subtraction)', (SELECT id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary')),
('Writing Skills', (SELECT id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary')),
('Science Observation', (SELECT id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary')),
('Research Skills', (SELECT id FROM skill_categories WHERE name = 'Academic Skills' AND age_group = 'elementary')),

-- Creative Arts
('Drawing & Painting', (SELECT id FROM skill_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Music & Singing', (SELECT id FROM skill_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Creative Writing', (SELECT id FROM skill_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Drama & Theater', (SELECT id FROM skill_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),
('Crafts & Making', (SELECT id FROM skill_categories WHERE name = 'Creative Arts' AND age_group = 'elementary')),

-- Physical Activities
('Swimming', (SELECT id FROM skill_categories WHERE name = 'Physical Activities' AND age_group = 'elementary')),
('Cycling', (SELECT id FROM skill_categories WHERE name = 'Physical Activities' AND age_group = 'elementary')),
('Team Sports', (SELECT id FROM skill_categories WHERE name = 'Physical Activities' AND age_group = 'elementary')),
('Dance', (SELECT id FROM skill_categories WHERE name = 'Physical Activities' AND age_group = 'elementary')),
('Martial Arts', (SELECT id FROM skill_categories WHERE name = 'Physical Activities' AND age_group = 'elementary')),

-- Technology
('Basic Computer Skills', (SELECT id FROM skill_categories WHERE name = 'Technology' AND age_group = 'elementary')),
('Educational Games', (SELECT id FROM skill_categories WHERE name = 'Technology' AND age_group = 'elementary')),
('Simple Programming (Scratch)', (SELECT id FROM skill_categories WHERE name = 'Technology' AND age_group = 'elementary')),
('Digital Art', (SELECT id FROM skill_categories WHERE name = 'Technology' AND age_group = 'elementary')),
('Safe Internet Use', (SELECT id FROM skill_categories WHERE name = 'Technology' AND age_group = 'elementary')),

-- Life Skills
('Time Management', (SELECT id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary')),
('Organization', (SELECT id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary')),
('Problem Solving', (SELECT id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary')),
('Teamwork', (SELECT id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary')),
('Leadership', (SELECT id FROM skill_categories WHERE name = 'Life Skills' AND age_group = 'elementary'));

-- Middle School Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES
('Academic Excellence', 'middle_school'),
('Creative Expression', 'middle_school'),
('Sports & Fitness', 'middle_school'),
('Technology & Innovation', 'middle_school'),
('Social Skills', 'middle_school');

-- Middle School Skills
INSERT INTO skills (name, category_id) VALUES
-- Academic Excellence
('Advanced Math', (SELECT id FROM skill_categories WHERE name = 'Academic Excellence' AND age_group = 'middle_school')),
('Science Experiments', (SELECT id FROM skill_categories WHERE name = 'Academic Excellence' AND age_group = 'middle_school')),
('Essay Writing', (SELECT id FROM skill_categories WHERE name = 'Academic Excellence' AND age_group = 'middle_school')),
('History Research', (SELECT id FROM skill_categories WHERE name = 'Academic Excellence' AND age_group = 'middle_school')),
('Foreign Language', (SELECT id FROM skill_categories WHERE name = 'Academic Excellence' AND age_group = 'middle_school')),

-- Creative Expression
('Photography', (SELECT id FROM skill_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Video Making', (SELECT id FROM skill_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Music Production', (SELECT id FROM skill_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Graphic Design', (SELECT id FROM skill_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),
('Creative Writing', (SELECT id FROM skill_categories WHERE name = 'Creative Expression' AND age_group = 'middle_school')),

-- Sports & Fitness
('Competitive Sports', (SELECT id FROM skill_categories WHERE name = 'Sports & Fitness' AND age_group = 'middle_school')),
('Fitness Training', (SELECT id FROM skill_categories WHERE name = 'Sports & Fitness' AND age_group = 'middle_school')),
('Outdoor Activities', (SELECT id FROM skill_categories WHERE name = 'Sports & Fitness' AND age_group = 'middle_school')),
('Team Leadership', (SELECT id FROM skill_categories WHERE name = 'Sports & Fitness' AND age_group = 'middle_school')),
('Individual Sports', (SELECT id FROM skill_categories WHERE name = 'Sports & Fitness' AND age_group = 'middle_school')),

-- Technology & Innovation
('Programming Languages', (SELECT id FROM skill_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Web Development', (SELECT id FROM skill_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Robotics', (SELECT id FROM skill_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('App Development', (SELECT id FROM skill_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),
('Digital Marketing', (SELECT id FROM skill_categories WHERE name = 'Technology & Innovation' AND age_group = 'middle_school')),

-- Social Skills
('Public Speaking', (SELECT id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school')),
('Debate & Discussion', (SELECT id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school')),
('Peer Mentoring', (SELECT id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school')),
('Community Service', (SELECT id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school')),
('Cultural Awareness', (SELECT id FROM skill_categories WHERE name = 'Social Skills' AND age_group = 'middle_school'));

-- High School Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES
('Academic Mastery', 'high_school'),
('Professional Skills', 'high_school'),
('Creative & Artistic', 'high_school'),
('Technology & Engineering', 'high_school'),
('Leadership & Service', 'high_school');

-- High School Skills
INSERT INTO skills (name, category_id) VALUES
-- Academic Mastery
('Advanced Mathematics', (SELECT id FROM skill_categories WHERE name = 'Academic Mastery' AND age_group = 'high_school')),
('Scientific Research', (SELECT id FROM skill_categories WHERE name = 'Academic Mastery' AND age_group = 'high_school')),
('Literature Analysis', (SELECT id FROM skill_categories WHERE name = 'Academic Mastery' AND age_group = 'high_school')),
('Historical Research', (SELECT id FROM skill_categories WHERE name = 'Academic Mastery' AND age_group = 'high_school')),
('Multiple Languages', (SELECT id FROM skill_categories WHERE name = 'Academic Mastery' AND age_group = 'high_school')),

-- Professional Skills
('Business Management', (SELECT id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'high_school')),
('Financial Literacy', (SELECT id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'high_school')),
('Marketing & Sales', (SELECT id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'high_school')),
('Project Management', (SELECT id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'high_school')),
('Data Analysis', (SELECT id FROM skill_categories WHERE name = 'Professional Skills' AND age_group = 'high_school')),

-- Creative & Artistic
('Professional Photography', (SELECT id FROM skill_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Video Production', (SELECT id FROM skill_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Music Composition', (SELECT id FROM skill_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Fashion Design', (SELECT id FROM skill_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),
('Architecture', (SELECT id FROM skill_categories WHERE name = 'Creative & Artistic' AND age_group = 'high_school')),

-- Technology & Engineering
('Advanced Programming', (SELECT id FROM skill_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Machine Learning', (SELECT id FROM skill_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Cybersecurity', (SELECT id FROM skill_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Game Development', (SELECT id FROM skill_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),
('Hardware Engineering', (SELECT id FROM skill_categories WHERE name = 'Technology & Engineering' AND age_group = 'high_school')),

-- Leadership & Service
('Student Government', (SELECT id FROM skill_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Community Leadership', (SELECT id FROM skill_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Volunteer Coordination', (SELECT id FROM skill_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Social Entrepreneurship', (SELECT id FROM skill_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school')),
('Global Citizenship', (SELECT id FROM skill_categories WHERE name = 'Leadership & Service' AND age_group = 'high_school'));

-- Young Adult Skill Categories
INSERT INTO skill_categories (name, age_group) VALUES
('Professional Development', 'young_adult'),
('Advanced Technical Skills', 'young_adult'),
('Creative Industries', 'young_adult'),
('Leadership & Management', 'young_adult'),
('Life & Wellness', 'young_adult');

-- Young Adult Skills
INSERT INTO skills (name, category_id) VALUES
-- Professional Development
('Career Planning', (SELECT id FROM skill_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Industry Expertise', (SELECT id FROM skill_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Professional Networking', (SELECT id FROM skill_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Advanced Certifications', (SELECT id FROM skill_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),
('Entrepreneurship', (SELECT id FROM skill_categories WHERE name = 'Professional Development' AND age_group = 'young_adult')),

-- Advanced Technical Skills
('Full-Stack Development', (SELECT id FROM skill_categories WHERE name = 'Advanced Technical Skills' AND age_group = 'young_adult')),
('Data Science', (SELECT id FROM skill_categories WHERE name = 'Advanced Technical Skills' AND age_group = 'young_adult')),
('AI & Machine Learning', (SELECT id FROM skill_categories WHERE name = 'Advanced Technical Skills' AND age_group = 'young_adult')),
('Cloud Computing', (SELECT id FROM skill_categories WHERE name = 'Advanced Technical Skills' AND age_group = 'young_adult')),
('DevOps', (SELECT id FROM skill_categories WHERE name = 'Advanced Technical Skills' AND age_group = 'young_adult')),

-- Creative Industries
('Professional Design', (SELECT id FROM skill_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Content Creation', (SELECT id FROM skill_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Brand Development', (SELECT id FROM skill_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Digital Marketing', (SELECT id FROM skill_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),
('Media Production', (SELECT id FROM skill_categories WHERE name = 'Creative Industries' AND age_group = 'young_adult')),

-- Leadership & Management
('Team Leadership', (SELECT id FROM skill_categories WHERE name = 'Leadership & Management' AND age_group = 'young_adult')),
('Strategic Planning', (SELECT id FROM skill_categories WHERE name = 'Leadership & Management' AND age_group = 'young_adult')),
('Change Management', (SELECT id FROM skill_categories WHERE name = 'Leadership & Management' AND age_group = 'young_adult')),
('Innovation Leadership', (SELECT id FROM skill_categories WHERE name = 'Leadership & Management' AND age_group = 'young_adult')),
('Global Perspective', (SELECT id FROM skill_categories WHERE name = 'Leadership & Management' AND age_group = 'young_adult')),

-- Life & Wellness
('Mental Health Awareness', (SELECT id FROM skill_categories WHERE name = 'Life & Wellness' AND age_group = 'young_adult')),
('Physical Fitness', (SELECT id FROM skill_categories WHERE name = 'Life & Wellness' AND age_group = 'young_adult')),
('Nutrition & Wellness', (SELECT id FROM skill_categories WHERE name = 'Life & Wellness' AND age_group = 'young_adult')),
('Sustainable Living', (SELECT id FROM skill_categories WHERE name = 'Life & Wellness' AND age_group = 'young_adult')),
('Personal Finance', (SELECT id FROM skill_categories WHERE name = 'Life & Wellness' AND age_group = 'young_adult'));

INSERT INTO achievement_categories (name) VALUES
('Academic Excellence'),
('Sports & Athletics'),
('Arts & Creativity'),
('Leadership & Service'),
('Skills & Certifications'),
('Competition & Contest'),
('Personal Development'),
('Technology & Innovation'),
('Community & Social Impact'),
('Cultural & Language');

-- Achievement Types (80 total achievements)
INSERT INTO achievement_types (category_id, name, description) VALUES
-- Academic Excellence (Category ID: 1)
(1, 'Honor Roll', 'Academic achievement recognition'),
(1, 'Dean''s List', 'High academic performance'),
(1, 'Academic Scholarship', 'Merit-based educational funding'),
(1, 'Perfect Attendance', 'Complete attendance record'),
(1, 'Subject Topper', 'Top performance in specific subject'),
(1, 'Research Publication', 'Published academic research'),
(1, 'Academic Award', 'General academic recognition'),
(1, 'Merit Certificate', 'Certificate of academic merit'),

-- Sports & Athletics (Category ID: 2)
(2, 'Championship Winner', 'First place in competition'),
(2, 'Tournament Participation', 'Active participation in tournaments'),
(2, 'Sports Scholarship', 'Athletic-based educational funding'),
(2, 'Team Captain', 'Leadership role in sports team'),
(2, 'Personal Best Record', 'Individual performance milestone'),
(2, 'Sports Award', 'Recognition for athletic achievement'),
(2, 'Athletic Achievement', 'General sports accomplishment'),
(2, 'Fitness Milestone', 'Personal fitness goal achievement'),

-- Arts & Creativity (Category ID: 3)
(3, 'Art Competition Winner', 'First place in art contest'),
(3, 'Creative Project', 'Completion of creative work'),
(3, 'Performance Award', 'Recognition for artistic performance'),
(3, 'Art Exhibition', 'Participation in art show'),
(3, 'Music Competition', 'Musical performance recognition'),
(3, 'Dance Performance', 'Dance achievement or performance'),
(3, 'Creative Writing', 'Writing achievement or publication'),
(3, 'Photography Award', 'Recognition for photographic work'),

-- Leadership & Service (Category ID: 4)
(4, 'Student Council', 'Elected student leadership position'),
(4, 'Club President', 'Leadership role in organization'),
(4, 'Volunteer Service', 'Community volunteer work'),
(4, 'Community Leader', 'Leadership in community activities'),
(4, 'Mentorship Award', 'Recognition for mentoring others'),
(4, 'Service Hours', 'Completion of volunteer hours'),
(4, 'Leadership Certificate', 'Formal leadership training'),
(4, 'Social Initiative', 'Leading social change project'),

-- Skills & Certifications (Category ID: 5)
(5, 'Professional Certification', 'Industry-recognized credential'),
(5, 'Skill Assessment', 'Formal skill evaluation'),
(5, 'Course Completion', 'Educational course achievement'),
(5, 'Training Certificate', 'Completion of training program'),
(5, 'License Achievement', 'Professional license obtained'),
(5, 'Competency Badge', 'Skill competency recognition'),
(5, 'Workshop Completion', 'Workshop participation certificate'),
(5, 'Skill Endorsement', 'Professional skill validation'),

-- Competition & Contest (Category ID: 6)
(6, 'Quiz Competition', 'Academic quiz achievement'),
(6, 'Debate Winner', 'Debate competition success'),
(6, 'Science Fair', 'Science fair participation or award'),
(6, 'Hackathon Winner', 'Programming competition success'),
(6, 'Olympiad Medal', 'Academic olympiad achievement'),
(6, 'Contest Participation', 'Active contest involvement'),
(6, 'Competition Award', 'General competition recognition'),
(6, 'Challenge Winner', 'Challenge competition success'),

-- Personal Development (Category ID: 7)
(7, 'Goal Achievement', 'Personal goal completion'),
(7, 'Personal Milestone', 'Significant personal accomplishment'),
(7, 'Habit Formation', 'Successful habit development'),
(7, 'Self Improvement', 'Personal growth achievement'),
(7, 'Learning Goal', 'Educational objective completion'),
(7, 'Personal Challenge', 'Self-imposed challenge success'),
(7, 'Growth Milestone', 'Personal development marker'),
(7, 'Achievement Unlocked', 'General personal accomplishment'),

-- Technology & Innovation (Category ID: 8)
(8, 'Coding Project', 'Programming project completion'),
(8, 'App Development', 'Mobile or web application creation'),
(8, 'Innovation Award', 'Recognition for innovative work'),
(8, 'Tech Competition', 'Technology competition achievement'),
(8, 'Patent Filed', 'Intellectual property creation'),
(8, 'Technical Presentation', 'Technology presentation achievement'),
(8, 'Programming Achievement', 'Coding skill recognition'),
(8, 'Digital Creation', 'Digital content or product creation'),

-- Community & Social Impact (Category ID: 9)
(9, 'Social Project', 'Community impact project'),
(9, 'Community Service', 'Service to local community'),
(9, 'Fundraising Success', 'Successful fundraising effort'),
(9, 'Awareness Campaign', 'Public awareness initiative'),
(9, 'Environmental Initiative', 'Environmental action project'),
(9, 'Social Impact Award', 'Recognition for social contribution'),
(9, 'Charity Work', 'Charitable activity participation'),
(9, 'Community Recognition', 'Community appreciation award'),

-- Cultural & Language (Category ID: 10)
(10, 'Language Proficiency', 'Language skill certification'),
(10, 'Cultural Performance', 'Cultural event participation'),
(10, 'Language Competition', 'Language contest achievement'),
(10, 'Cultural Award', 'Cultural contribution recognition'),
(10, 'Translation Work', 'Translation project completion'),
(10, 'Cultural Exchange', 'Cultural exchange participation'),
(10, 'Heritage Project', 'Cultural heritage preservation'),
(10, 'Multilingual Achievement', 'Multiple language proficiency');



-- Insert Institution Categories
INSERT INTO institution_categories (name, slug, description) VALUES
('Traditional Educational Institutions', 'traditional-educational', 'Formal educational institutions following conventional academic structures'),
('Specialized Training & Coaching', 'specialized-training-coaching', 'Institutions focused on specific skill development and professional training'),
('Arts, Sports & Performance Education', 'arts-sports-performance', 'Creative and physical education institutions'),
('Special & Alternative Education', 'special-alternative-education', 'Educational institutions serving special needs and alternative learning approaches'),
('Government Educational Institutions', 'government-educational', 'Educational institutions operated by government entities'),
('Non-Governmental Organizations (NGOs)', 'ngo-educational', 'Non-profit organizations focused on educational initiatives'),
('Modern Learning Environments', 'modern-learning', 'Technology-enabled and contemporary learning platforms'),
('Other Educational Institutions', 'other-educational', 'Miscellaneous educational institutions not covered in other categories');

-- Insert Institution Types
INSERT INTO institution_types (category_id, name, slug, description) VALUES
-- Traditional Educational Institutions (category_id = 1)
(1, 'Preschool/Kindergarten', 'preschool-kindergarten', 'Early childhood education institutions'),
(1, 'Primary School', 'primary-school', 'Elementary education institutions'),
(1, 'Secondary/High School', 'secondary-high-school', 'Secondary education institutions'),
(1, 'University', 'university', 'Higher education institutions offering undergraduate and graduate degrees'),
(1, 'College', 'college', 'Higher education institutions offering undergraduate programs'),
(1, 'Community/Junior College', 'community-junior-college', 'Two-year higher education institutions'),
(1, 'Polytechnic', 'polytechnic', 'Technical education institutions'),
(1, 'Vocational/Trade School', 'vocational-trade-school', 'Institutions focused on practical skills training'),

-- Specialized Training & Coaching (category_id = 2)
(2, 'Career Coaching Center', 'career-coaching-center', 'Professional career development and coaching services'),
(2, 'Professional Skills Training', 'professional-skills-training', 'Workplace and professional skills development'),
(2, 'IT/Technical Training Institute', 'it-technical-training', 'Information technology and technical skills training'),
(2, 'Competitive Exam Coaching', 'competitive-exam-coaching', 'Preparation for competitive examinations'),
(2, 'Test Preparation Center', 'test-preparation-center', 'Standardized test preparation services'),
(2, 'Subject Tutoring Center', 'subject-tutoring-center', 'Academic subject-specific tutoring'),
(2, 'Language Institute', 'language-institute', 'Foreign and native language learning'),
(2, 'Soft Skills Development Center', 'soft-skills-development', 'Communication and interpersonal skills training'),

-- Arts, Sports & Performance Education (category_id = 3)
(3, 'Sports Academy/Athletic Training', 'sports-academy', 'Athletic and sports training institutions'),
(3, 'Music School/Conservatory', 'music-school', 'Musical education and performance training'),
(3, 'Dance Academy', 'dance-academy', 'Dance and choreography training'),
(3, 'Fine Arts Institution', 'fine-arts-institution', 'Visual and fine arts education'),
(3, 'Drama/Theater School', 'drama-theater-school', 'Theatrical and dramatic arts training'),
(3, 'Film and Media Academy', 'film-media-academy', 'Film production and media arts education'),
(3, 'Martial Arts/Physical Training', 'martial-arts-training', 'Martial arts and physical fitness training'),
(3, 'Yoga and Wellness Academy', 'yoga-wellness-academy', 'Yoga, meditation, and wellness training'),

-- Special & Alternative Education (category_id = 4)
(4, 'Special Needs Education Center', 'special-needs-education', 'Education for students with special needs'),
(4, 'Remedial Education Institution', 'remedial-education', 'Remedial and supplementary education'),
(4, 'Gifted Education Program', 'gifted-education-program', 'Education for gifted and talented students'),
(4, 'Therapeutic Education Center', 'therapeutic-education', 'Education combined with therapeutic services'),
(4, 'Montessori/Waldorf School', 'montessori-waldorf-school', 'Alternative education methodologies'),
(4, 'Homeschooling Support Center', 'homeschooling-support', 'Support services for homeschooling families'),
(4, 'Alternative Education School', 'alternative-education', 'Non-traditional educational approaches'),

-- Government Educational Institutions (category_id = 5)
(5, 'Public School System Administration', 'public-admin', 'Government-operated school systems'),
(5, 'Government University/College', 'govt-university', 'Government-funded higher education institutions'),
(5, 'Military/Defense Training Academy', 'military-academy', 'Military and defense training institutions'),
(5, 'Civil Service Training Institute', 'civil-service', 'Training for government employees'),
(5, 'Government Research Institution', 'govt-research', 'Government-funded research institutions'),
(5, 'Public Vocational Training Center', 'public-vocational', 'Government-operated vocational training'),
(5, 'Government Sports Authority', 'govt-sports', 'Government sports and athletics programs'),

-- Non-Governmental Organizations (category_id = 6)
(6, 'Educational NGO', 'edu-ngo', 'Non-profit educational organizations'),
(6, 'Skill Development Organization', 'skill-dev', 'NGOs focused on skill development'),
(6, 'Literacy Program Provider', 'literacy', 'Organizations promoting literacy'),
(6, 'Educational Resource Provider', 'resource', 'NGOs providing educational resources'),
(6, 'Community Learning Center', 'community', 'Community-based learning initiatives'),
(6, 'International Education Organization', 'international', 'International educational NGOs'),
(6, 'Special Needs Support Organization', 'special-needs-ngo', 'NGOs supporting special needs education'),

-- Modern Learning Environments (category_id = 7)
(7, 'Online Learning Platform', 'online', 'Digital and online education platforms'),
(7, 'Blended Learning Provider', 'blended', 'Hybrid online and offline learning'),
(7, 'Continuing Education Center', 'continuing-ed', 'Lifelong learning and continuing education'),
(7, 'Educational Technology Provider', 'edtech', 'Technology-focused educational services'),
(7, 'Massive Open Online Course (MOOC) Provider', 'mooc', 'Large-scale online course platforms'),
(7, 'Virtual School', 'virtual-school', 'Fully virtual educational institutions'),
(7, 'Microlearning Platform', 'microlearning', 'Short-form, focused learning modules'),

-- Other Educational Institutions (category_id = 8)
(8, 'Corporate Training Department', 'corporate-training', 'Corporate internal training programs'),
(8, 'Independent Research Institute', 'research-institute', 'Independent research organizations'),
(8, 'Educational Think Tank', 'think-tank', 'Policy and research think tanks'),
(8, 'Educational Publishing Organization', 'publishing', 'Educational content publishers'),
(8, 'Educational Assessment Provider', 'assessment', 'Testing and assessment organizations'),
(8, 'Other (Not Listed)', 'other-type', 'Educational institutions not covered in other categories');

