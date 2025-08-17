
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, serial, sql } from 'drizzle-orm/pg-core'

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
  role: varchar('role').notNull(),
  bio: text('bio'),
  location: varchar('location'),
  profileImageUrl: varchar('profile_image_url'),
  verificationStatus: boolean('verification_status').default(false),
  availabilityStatus: varchar('availability_status'),
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
