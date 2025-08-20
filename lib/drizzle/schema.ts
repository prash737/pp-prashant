
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
  description: text('description').notNull(),
  category: text('category').notNull(),
  timeframe: text('timeframe').notNull(),
  isAdded: boolean('is_added').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
