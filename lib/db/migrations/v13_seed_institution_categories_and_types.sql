
-- Migration v13: Seed institution categories and types with comprehensive data

-- Insert institution categories
INSERT INTO institution_categories (name, slug, description) VALUES
('Traditional Educational Institutions', 'traditional-educational', 'Formal educational institutions following conventional academic structures'),
('Specialized Training & Coaching', 'specialized-training-coaching', 'Institutions focused on specific skill development and professional training'),
('Arts, Sports & Performance Education', 'arts-sports-performance', 'Creative and physical education institutions'),
('Special & Alternative Education', 'special-alternative-education', 'Educational institutions serving special needs and alternative learning approaches'),
('Government Educational Institutions', 'government-educational', 'Educational institutions operated by government entities'),
('Non-Governmental Organizations (NGOs)', 'ngo-educational', 'Non-profit organizations focused on educational initiatives'),
('Modern Learning Environments', 'modern-learning', 'Technology-enabled and contemporary learning platforms'),
('Other Educational Institutions', 'other-educational', 'Miscellaneous educational institutions not covered in other categories')
ON CONFLICT (slug) DO NOTHING;

-- Insert institution types for Traditional Educational Institutions
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id::integer,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Preschool/Kindergarten', 'preschool-kindergarten', 'Early childhood education institutions'),
    ('Primary School', 'primary-school', 'Elementary education institutions'),
    ('Secondary/High School', 'secondary-high-school', 'Secondary education institutions'),
    ('University', 'university', 'Higher education institutions offering undergraduate and graduate degrees'),
    ('College', 'college', 'Higher education institutions offering undergraduate programs'),
    ('Community/Junior College', 'community-junior-college', 'Two-year higher education institutions'),
    ('Polytechnic', 'polytechnic', 'Technical education institutions'),
    ('Vocational/Trade School', 'vocational-trade-school', 'Institutions focused on practical skills training')
) AS type_data(name, slug, description)
WHERE ic.slug = 'traditional-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Specialized Training & Coaching
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Career Coaching Center', 'career-coaching-center', 'Professional career development and coaching services'),
    ('Professional Skills Training', 'professional-skills-training', 'Workplace and professional skills development'),
    ('IT/Technical Training Institute', 'it-technical-training', 'Information technology and technical skills training'),
    ('Competitive Exam Coaching', 'competitive-exam-coaching', 'Preparation for competitive examinations'),
    ('Test Preparation Center', 'test-preparation-center', 'Standardized test preparation services'),
    ('Subject Tutoring Center', 'subject-tutoring-center', 'Academic subject-specific tutoring'),
    ('Language Institute', 'language-institute', 'Foreign and native language learning'),
    ('Soft Skills Development Center', 'soft-skills-development', 'Communication and interpersonal skills training')
) AS type_data(name, slug, description)
WHERE ic.slug = 'specialized-training-coaching'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Arts, Sports & Performance Education
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Sports Academy/Athletic Training', 'sports-academy', 'Athletic and sports training institutions'),
    ('Music School/Conservatory', 'music-school', 'Musical education and performance training'),
    ('Dance Academy', 'dance-academy', 'Dance and choreography training'),
    ('Fine Arts Institution', 'fine-arts-institution', 'Visual and fine arts education'),
    ('Drama/Theater School', 'drama-theater-school', 'Theatrical and dramatic arts training'),
    ('Film and Media Academy', 'film-media-academy', 'Film production and media arts education'),
    ('Martial Arts/Physical Training', 'martial-arts-training', 'Martial arts and physical fitness training'),
    ('Yoga and Wellness Academy', 'yoga-wellness-academy', 'Yoga, meditation, and wellness training')
) AS type_data(name, slug, description)
WHERE ic.slug = 'arts-sports-performance'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Special & Alternative Education
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Special Needs Education Center', 'special-needs-education', 'Education for students with special needs'),
    ('Remedial Education Institution', 'remedial-education', 'Remedial and supplementary education'),
    ('Gifted Education Program', 'gifted-education-program', 'Education for gifted and talented students'),
    ('Therapeutic Education Center', 'therapeutic-education', 'Education combined with therapeutic services'),
    ('Montessori/Waldorf School', 'montessori-waldorf-school', 'Alternative education methodologies'),
    ('Homeschooling Support Center', 'homeschooling-support', 'Support services for homeschooling families'),
    ('Alternative Education School', 'alternative-education', 'Non-traditional educational approaches')
) AS type_data(name, slug, description)
WHERE ic.slug = 'special-alternative-education'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Government Educational Institutions
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Public School System Administration', 'public-admin', 'Government-operated school systems'),
    ('Government University/College', 'govt-university', 'Government-funded higher education institutions'),
    ('Military/Defense Training Academy', 'military-academy', 'Military and defense training institutions'),
    ('Civil Service Training Institute', 'civil-service', 'Training for government employees'),
    ('Government Research Institution', 'govt-research', 'Government-funded research institutions'),
    ('Public Vocational Training Center', 'public-vocational', 'Government-operated vocational training'),
    ('Government Sports Authority', 'govt-sports', 'Government sports and athletics programs')
) AS type_data(name, slug, description)
WHERE ic.slug = 'government-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Non-Governmental Organizations (NGOs)
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Educational NGO', 'edu-ngo', 'Non-profit educational organizations'),
    ('Skill Development Organization', 'skill-dev', 'NGOs focused on skill development'),
    ('Literacy Program Provider', 'literacy', 'Organizations promoting literacy'),
    ('Educational Resource Provider', 'resource', 'NGOs providing educational resources'),
    ('Community Learning Center', 'community', 'Community-based learning initiatives'),
    ('International Education Organization', 'international', 'International educational NGOs'),
    ('Special Needs Support Organization', 'special-needs-ngo', 'NGOs supporting special needs education')
) AS type_data(name, slug, description)
WHERE ic.slug = 'ngo-educational'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Modern Learning Environments
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Online Learning Platform', 'online', 'Digital and online education platforms'),
    ('Blended Learning Provider', 'blended', 'Hybrid online and offline learning'),
    ('Continuing Education Center', 'continuing-ed', 'Lifelong learning and continuing education'),
    ('Educational Technology Provider', 'edtech', 'Technology-focused educational services'),
    ('Massive Open Online Course (MOOC) Provider', 'mooc', 'Large-scale online course platforms'),
    ('Virtual School', 'virtual-school', 'Fully virtual educational institutions'),
    ('Microlearning Platform', 'microlearning', 'Short-form, focused learning modules')
) AS type_data(name, slug, description)
WHERE ic.slug = 'modern-learning'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert institution types for Other Educational Institutions
INSERT INTO institution_types (category_id, name, slug, description)
SELECT 
  ic.id,
  type_data.name,
  type_data.slug,
  type_data.description
FROM institution_categories ic
CROSS JOIN (
  VALUES 
    ('Corporate Training Department', 'corporate-training', 'Corporate internal training programs'),
    ('Independent Research Institute', 'research-institute', 'Independent research organizations'),
    ('Educational Think Tank', 'think-tank', 'Policy and research think tanks'),
    ('Educational Publishing Organization', 'publishing', 'Educational content publishers'),
    ('Educational Assessment Provider', 'assessment', 'Testing and assessment organizations'),
    ('Other (Not Listed)', 'other-type', 'Educational institutions not covered in other categories')
) AS type_data(name, slug, description)
WHERE ic.slug = 'other-educational'
ON CONFLICT (category_id, slug) DO NOTHING;
