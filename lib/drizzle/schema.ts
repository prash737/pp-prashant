
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, serial, pgEnum } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Enums
export const ageGroupEnum = pgEnum('age_group', ['early_childhood', 'elementary', 'middle_school', 'high_school', 'young_adult'])
export const userRoleEnum = pgEnum('user_role', ['student', 'mentor', 'institution'])

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  dateOfAchievement: timestamp('date_of_achievement').notNull(),
  achievementTypeId: integer('achievement_type_id'),
  achievementImageIcon: varchar('achievement_image_icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email'),
  role: userRoleEnum('role').notNull(),
  bio: text('bio'),
  location: varchar('location'),
  profileImageUrl: varchar('profile_image_url'),
  verificationStatus: boolean('verification_status').default(false),
  availabilityStatus: varchar('availability_status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const studentProfiles = pgTable('student_profiles', {
  id: uuid('id').primaryKey(),
  ageGroup: ageGroupEnum('age_group'),
  educationLevel: varchar('education_level').notNull(),
  birthMonth: varchar('birth_month'),
  birthYear: varchar('birth_year'),
  personalityType: varchar('personality_type'),
  learningStyle: varchar('learning_style'),
  favoriteQuote: varchar('favorite_quote'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const interestCategories = pgTable('interest_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const interests = pgTable('interests', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  categoryId: integer('category_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userInterests = pgTable('user_interests', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  interestId: integer('interest_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const skillCategories = pgTable('skill_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull(),
  categoryId: integer('category_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userSkills = pgTable('user_skills', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  skillId: integer('skill_id').notNull(),
  proficiencyLevel: integer('proficiency_level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const circleBadges = pgTable('circle_badges', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  creatorId: uuid('creator_id').notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 20 }).default('#3B82F6'),
  icon: varchar('icon', { length: 50 }).default('users'),
  isDefault: boolean('is_default').default(false),
  isDisabled: boolean('is_disabled').default(false),
  isCreatorDisabled: boolean('is_creator_disabled').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const circleMemberships = pgTable('circle_memberships', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  circleId: uuid('circle_id').notNull(),
  userId: uuid('user_id').notNull(),
  status: varchar('status', { length: 20 }).default('active'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  isDisabledMember: boolean('is_disabled_member').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user1Id: uuid('user1_id').notNull(),
  user2Id: uuid('user2_id').notNull(),
  connectionType: text('connection_type').notNull().default('friend'),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
})

export const suggestedGoals = pgTable('suggested_goals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  timeframe: text('timeframe'),
  isAdded: boolean('is_added').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userCollections = pgTable('user_collections', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const moodBoard = pgTable('mood_board', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  position: integer('position').default(0),
  collectionId: integer('collection_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tokenUsage = pgTable('token_usage', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  promptToken: integer('prompt_token').notNull(),
  modelName: text('model_name').notNull(),
  responseToken: integer('response_token').notNull(),
  userId: uuid('user_id').notNull(),
})

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  timeframe: text('timeframe'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const mentorProfiles = pgTable('mentor_profiles', {
  id: uuid('id').primaryKey(),
  experience: text('experience'),
  expertise: text('expertise'),
  availability: text('availability'),
  sessionPreferences: text('session_preferences'),
  certifications: text('certifications'),
  languagesSpoken: text('languages_spoken'),
  hourlyRate: integer('hourly_rate'),
  responseTime: varchar('response_time'),
  successStories: text('success_stories'),
  approachMethodology: text('approach_methodology'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const institutionProfiles = pgTable('institution_profiles', {
  id: uuid('id').primaryKey(),
  institutionName: varchar('institution_name').notNull(),
  institutionType: varchar('institution_type').notNull(),
  establishedYear: varchar('established_year'),
  website: varchar('website'),
  description: text('description'),
  mission: text('mission'),
  vision: text('vision'),
  accreditation: text('accreditation'),
  studentCapacity: integer('student_capacity'),
  facultyCount: integer('faculty_count'),
  campusSize: varchar('campus_size'),
  tuitionRange: varchar('tuition_range'),
  admissionRequirements: text('admission_requirements'),
  specialPrograms: text('special_programs'),
  achievements: text('achievements'),
  contactEmail: varchar('contact_email'),
  contactPhone: varchar('contact_phone'),
  address: text('address'),
  city: varchar('city'),
  state: varchar('state'),
  country: varchar('country'),
  postalCode: varchar('postal_code'),
  logoUrl: varchar('logo_url'),
  coverImageUrl: varchar('cover_image_url'),
  verificationStatus: boolean('verification_status').default(false),
  followerCount: integer('follower_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const feedPosts = pgTable('feed_posts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  repostsCount: integer('reposts_count').default(0),
  isRepost: boolean('is_repost').default(false),
  originalPostId: uuid('original_post_id'),
  linkPreview: text('link_preview'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
