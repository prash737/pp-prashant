
export const INSTITUTION_PLACEHOLDERS = {
  // Traditional Educational Institutions
  'preschool-kindergarten': {
    course: 'e.g., Play-based Learning, Pre-Math, Story Time',
    degree: 'e.g., Kindergarten Certificate, Pre-school Completion',
    grade: 'e.g., Nursery, LKG, UKG'
  },
  'primary-school': {
    course: 'e.g., Mathematics, Hindi, English, Environmental Studies',
    degree: 'e.g., Primary School Certificate, Class 5 Certificate',
    grade: 'e.g., Class 1, Class 2, Class 3, Class 4, Class 5'
  },
  'secondary-high-school': {
    course: 'e.g., Mathematics, Science, Social Studies, English, Hindi',
    degree: 'e.g., 10th Board Certificate, 12th Board Certificate, CBSE Marksheet',
    grade: 'e.g., Class 10, Class 12, Standard VIII, 9th Grade'
  },
  'university': {
    course: 'e.g., B.Tech Computer Science, B.Com, M.A. English, MBBS',
    degree: 'e.g., Bachelor\'s Degree, Master\'s Degree, PhD, Diploma',
    grade: 'e.g., 1st Year, Final Year, Semester 3, Post Graduate'
  },
  'college': {
    course: 'e.g., B.A. Psychology, B.Sc. Physics, B.Com Honours',
    degree: 'e.g., Bachelor\'s Degree, Diploma, Advanced Diploma',
    grade: 'e.g., 1st Year, 2nd Year, 3rd Year, Final Year'
  },
  'polytechnic': {
    course: 'e.g., Mechanical Engineering, Civil Engineering, Computer Science',
    degree: 'e.g., Diploma in Engineering, Polytechnic Certificate',
    grade: 'e.g., 1st Year, 2nd Year, 3rd Year'
  },
  'vocational-trade-school': {
    course: 'e.g., Electrician, Fitter, Computer Operator, Welding',
    degree: 'e.g., ITI Certificate, Trade Certificate, NCVT Certificate',
    grade: 'e.g., 1st Year, 2nd Year, Apprenticeship Level'
  },

  // Specialized Training & Coaching
  'competitive-exam-coaching': {
    course: 'e.g., JEE Main & Advanced, NEET, CAT, UPSC, SSC CGL',
    degree: 'e.g., Course Completion Certificate, Mock Test Series',
    grade: 'e.g., Foundation Level, Advanced Level, Crash Course'
  },
  'it-technical-training': {
    course: 'e.g., Full Stack Development, Data Science, Digital Marketing',
    degree: 'e.g., Professional Certificate, Industry Certification, Diploma',
    grade: 'e.g., Beginner, Intermediate, Advanced, Professional Level'
  },
  'language-institute': {
    course: 'e.g., Spoken English, IELTS Preparation, German Language, Hindi Grammar',
    degree: 'e.g., Language Proficiency Certificate, IELTS Score, Conversation Course',
    grade: 'e.g., Basic Level, Intermediate, Advanced, Fluency Level'
  },
  'test-preparation-center': {
    course: 'e.g., IELTS, TOEFL, GRE, GMAT, SAT',
    degree: 'e.g., Test Preparation Certificate, Score Improvement Program',
    grade: 'e.g., Beginner, Intermediate, Advanced, Intensive'
  },

  // Arts, Sports & Performance Education
  'sports-academy': {
    course: 'e.g., Cricket Coaching, Football Training, Swimming, Athletics',
    degree: 'e.g., Sports Certificate, Performance Certificate, Competition Medal',
    grade: 'e.g., Beginner, Junior Level, Senior Level, Professional'
  },
  'music-school': {
    course: 'e.g., Classical Vocal, Guitar, Piano, Tabla, Violin',
    degree: 'e.g., Music Certificate, Grade Certification, Performance Diploma',
    grade: 'e.g., Grade 1, Grade 2, Intermediate, Advanced'
  },
  'dance-academy': {
    course: 'e.g., Classical Dance, Bharatanatyam, Hip-Hop, Contemporary',
    degree: 'e.g., Dance Certificate, Performance Certificate, Grade Certification',
    grade: 'e.g., Beginner, Intermediate, Advanced, Professional'
  },
  'fine-arts': {
    course: 'e.g., Painting, Sketching, Sculpture, Digital Art',
    degree: 'e.g., Fine Arts Certificate, Portfolio Certification',
    grade: 'e.g., Beginner, Intermediate, Advanced, Expert Level'
  },

  // Modern Learning Environments
  'online': {
    course: 'e.g., Coding for Kids, Spoken English, Competitive Programming',
    degree: 'e.g., Course Completion Badge, Skill Certificate, Achievement Certificate',
    grade: 'e.g., Beginner, Intermediate, Advanced, Expert Level'
  },
  'edtech': {
    course: 'e.g., Interactive Math, Science Experiments, Language Learning',
    degree: 'e.g., Digital Certificate, Learning Badge, Completion Certificate',
    grade: 'e.g., Foundation, Intermediate, Advanced, Mastery Level'
  },

  // Default fallback for any institution type
  'default': {
    course: 'e.g., Subject or Course Name',
    degree: 'e.g., Certificate, Diploma, Degree',
    grade: 'e.g., Level, Grade, Year'
  }
}

// Helper function to get placeholders for a specific institution type
export function getPlaceholdersForType(typeSlug: string) {
  return INSTITUTION_PLACEHOLDERS[typeSlug as keyof typeof INSTITUTION_PLACEHOLDERS] || INSTITUTION_PLACEHOLDERS.default
}

// Helper function to get specific placeholder text
export function getPlaceholderText(typeSlug: string, field: 'course' | 'degree' | 'grade') {
  const placeholders = getPlaceholdersForType(typeSlug)
  return placeholders[field]
}
