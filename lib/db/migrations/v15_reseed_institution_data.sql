
-- Migration v15: Re-seed institution categories and types with integer IDs

-- Clear existing data
DELETE FROM institution_types;
DELETE FROM institution_categories;

-- Reset sequences to start from 1
ALTER SEQUENCE institution_categories_id_seq RESTART WITH 1;
ALTER SEQUENCE institution_types_id_seq RESTART WITH 1;

-- Insert institution categories
INSERT INTO institution_categories (name, slug, description) VALUES
('Traditional Educational Institutions', 'traditional-educational', 'Formal educational institutions following conventional academic structures'),
('Specialized Training & Coaching', 'specialized-training-coaching', 'Institutions focused on specific skill development and professional training'),
('Arts, Sports & Performance Education', 'arts-sports-performance', 'Creative and physical education institutions'),
('Special & Alternative Education', 'special-alternative-education', 'Educational institutions serving special needs and alternative learning approaches'),
('Government Educational Institutions', 'government-educational', 'Educational institutions operated by government entities'),
('Non-Governmental Organizations (NGOs)', 'ngo-educational', 'Non-profit organizations focused on educational initiatives'),
('Modern Learning Environments', 'modern-learning', 'Technology-enabled and contemporary learning platforms'),
('Other Educational Institutions', 'other-educational', 'Miscellaneous educational institutions not covered in other categories');

-- Insert institution types for Traditional Educational Institutions (ID: 1)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(1, 'Preschool/Kindergarten', 'preschool-kindergarten', 'Early childhood education institutions'),
(1, 'Primary School', 'primary-school', 'Elementary education institutions'),
(1, 'Secondary/High School', 'secondary-high-school', 'Secondary education institutions'),
(1, 'University', 'university', 'Higher education institutions offering undergraduate and graduate degrees'),
(1, 'College', 'college', 'Higher education institutions offering undergraduate programs'),
(1, 'Community/Junior College', 'community-junior-college', 'Two-year higher education institutions'),
(1, 'Polytechnic', 'polytechnic', 'Technical education institutions'),
(1, 'Vocational/Trade School', 'vocational-trade-school', 'Institutions focused on practical skills training');

-- Insert institution types for Specialized Training & Coaching (ID: 2)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(2, 'Career Coaching Center', 'career-coaching-center', 'Professional career development and coaching services'),
(2, 'Professional Skills Training', 'professional-skills-training', 'Workplace and professional skills development'),
(2, 'IT/Technical Training Institute', 'it-technical-training', 'Information technology and technical skills training'),
(2, 'Competitive Exam Coaching', 'competitive-exam-coaching', 'Preparation for competitive examinations'),
(2, 'Test Preparation Center', 'test-preparation-center', 'Standardized test preparation services'),
(2, 'Subject Tutoring Center', 'subject-tutoring-center', 'Academic subject-specific tutoring'),
(2, 'Language Institute', 'language-institute', 'Foreign and native language learning'),
(2, 'Soft Skills Development Center', 'soft-skills-development', 'Communication and interpersonal skills training');

-- Insert institution types for Arts, Sports & Performance Education (ID: 3)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(3, 'Sports Academy/Athletic Training', 'sports-academy', 'Athletic and sports training institutions'),
(3, 'Music School/Conservatory', 'music-school', 'Musical education and performance training'),
(3, 'Dance Academy', 'dance-academy', 'Dance and choreography training'),
(3, 'Fine Arts Institution', 'fine-arts-institution', 'Visual and fine arts education'),
(3, 'Drama/Theater School', 'drama-theater-school', 'Theatrical and dramatic arts training'),
(3, 'Film and Media Academy', 'film-media-academy', 'Film production and media arts education'),
(3, 'Martial Arts/Physical Training', 'martial-arts-training', 'Martial arts and physical fitness training'),
(3, 'Yoga and Wellness Academy', 'yoga-wellness-academy', 'Yoga, meditation, and wellness training');

-- Insert institution types for Special & Alternative Education (ID: 4)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(4, 'Special Needs Education Center', 'special-needs-education', 'Education for students with special needs'),
(4, 'Remedial Education Institution', 'remedial-education', 'Remedial and supplementary education'),
(4, 'Gifted Education Program', 'gifted-education-program', 'Education for gifted and talented students'),
(4, 'Therapeutic Education Center', 'therapeutic-education', 'Education combined with therapeutic services'),
(4, 'Montessori/Waldorf School', 'montessori-waldorf-school', 'Alternative education methodologies'),
(4, 'Homeschooling Support Center', 'homeschooling-support', 'Support services for homeschooling families'),
(4, 'Alternative Education School', 'alternative-education', 'Non-traditional educational approaches');

-- Insert institution types for Government Educational Institutions (ID: 5)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(5, 'Public School System Administration', 'public-admin', 'Government-operated school systems'),
(5, 'Government University/College', 'govt-university', 'Government-funded higher education institutions'),
(5, 'Military/Defense Training Academy', 'military-academy', 'Military and defense training institutions'),
(5, 'Civil Service Training Institute', 'civil-service', 'Training for government employees'),
(5, 'Government Research Institution', 'govt-research', 'Government-funded research institutions'),
(5, 'Public Vocational Training Center', 'public-vocational', 'Government-operated vocational training'),
(5, 'Government Sports Authority', 'govt-sports', 'Government sports and athletics programs');

-- Insert institution types for Non-Governmental Organizations (ID: 6)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(6, 'Educational NGO', 'edu-ngo', 'Non-profit educational organizations'),
(6, 'Skill Development Organization', 'skill-dev', 'NGOs focused on skill development'),
(6, 'Literacy Program Provider', 'literacy', 'Organizations promoting literacy'),
(6, 'Educational Resource Provider', 'resource', 'NGOs providing educational resources'),
(6, 'Community Learning Center', 'community', 'Community-based learning initiatives'),
(6, 'International Education Organization', 'international', 'International educational NGOs'),
(6, 'Special Needs Support Organization', 'special-needs-ngo', 'NGOs supporting special needs education');

-- Insert institution types for Modern Learning Environments (ID: 7)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(7, 'Online Learning Platform', 'online', 'Digital and online education platforms'),
(7, 'Blended Learning Provider', 'blended', 'Hybrid online and offline learning'),
(7, 'Continuing Education Center', 'continuing-ed', 'Lifelong learning and continuing education'),
(7, 'Educational Technology Provider', 'edtech', 'Technology-focused educational services'),
(7, 'Massive Open Online Course (MOOC) Provider', 'mooc', 'Large-scale online course platforms'),
(7, 'Virtual School', 'virtual-school', 'Fully virtual educational institutions'),
(7, 'Microlearning Platform', 'microlearning', 'Short-form, focused learning modules');

-- Insert institution types for Other Educational Institutions (ID: 8)
INSERT INTO institution_types (category_id, name, slug, description) VALUES
(8, 'Corporate Training Department', 'corporate-training', 'Corporate internal training programs'),
(8, 'Independent Research Institute', 'research-institute', 'Independent research organizations'),
(8, 'Educational Think Tank', 'think-tank', 'Policy and research think tanks'),
(8, 'Educational Publishing Organization', 'publishing', 'Educational content publishers'),
(8, 'Educational Assessment Provider', 'assessment', 'Testing and assessment organizations'),
(8, 'Other (Not Listed)', 'other-type', 'Educational institutions not covered in other categories');
