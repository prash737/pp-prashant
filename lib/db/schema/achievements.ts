import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const achievementCategories = pgTable('achievement_categories', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const achievementTypes = pgTable('achievement_types', {
  id: integer('id').primaryKey().generatedByDefaultAsIdentity(),
  categoryId: integer('category_id').notNull().references(() => achievementCategories.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 500 }),
  requirements: text('requirements'),
  points: integer('points').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  achievementTypeId: integer('achievement_type_id').references(() => achievementTypes.id),
  customTitle: varchar('custom_title', { length: 255 }),
  customDescription: text('custom_description'),
  customIconUrl: varchar('custom_icon_url', { length: 500 }),
  dateEarned: timestamp('date_earned'),
  isVerified: boolean('is_verified').default(false),
  verificationSource: varchar('verification_source', { length: 255 }),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customBadges = pgTable('custom_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  iconUrl: varchar('icon_url', { length: 500 }),
  color: varchar('color', { length: 50 }),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const moodBoard = pgTable('mood_board', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  caption: text('caption'),
  position: integer('position').default(0),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});