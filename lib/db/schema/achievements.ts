
import { pgTable, uuid, text, timestamp, integer, serial, date, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  timeframe: text('timeframe'),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userCollections = pgTable('user_collections', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const moodBoard = pgTable('mood_board', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  position: integer('position').default(0),
  collectionId: integer('collection_id').references(() => userCollections.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const customBadges = pgTable('custom_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  color: text('color').default('#3B82F6'),
  earnedDate: date('earned_date').defaultNow(),
  issuer: text('issuer'),
  verificationUrl: text('verification_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const achievementCategories = pgTable('achievement_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const achievementTypes = pgTable('achievement_types', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => achievementCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  dateOfAchievement: date('date_of_achievement').notNull(),
  achievementTypeId: integer('achievement_type_id').references(() => achievementTypes.id),
  achievementImageIcon: text('achievement_image_icon'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
