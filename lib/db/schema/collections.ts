
import { pgTable, varchar, uuid, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const userCollections = pgTable('user_collections', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: varchar('description'),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const moodBoard = pgTable('mood_board', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url').notNull(),
  caption: varchar('caption'),
  position: integer('position').default(0).notNull(),
  collectionId: integer('collection_id').references(() => userCollections.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const customBadges = pgTable('custom_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  description: varchar('description'),
  iconUrl: varchar('icon_url'),
  color: varchar('color').default('#3B82F6').notNull(),
  earnedDate: timestamp('earned_date').defaultNow().notNull(),
  issuer: varchar('issuer'),
  verificationUrl: varchar('verification_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
