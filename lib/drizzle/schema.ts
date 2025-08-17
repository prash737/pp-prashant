
import { pgTable, uuid, varchar, text, timestamp, integer, boolean, serial } from 'drizzle-orm/pg-core'

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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
