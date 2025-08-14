import { pgTable, varchar, uuid, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: uuid('user1_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).notNull().default('accepted'),
  connectedAt: timestamp('connected_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  platform: varchar('platform', { length: 100 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const languages = pgTable('languages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull().unique(),
  code: varchar('code').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const userLanguages = pgTable('user_languages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  proficiencyLevel: varchar('proficiency_level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const hobbies = pgTable('hobbies', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name').notNull().unique(),
  category: varchar('category'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const userHobbies = pgTable('user_hobbies', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  hobbyId: integer('hobby_id').notNull().references(() => hobbies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});