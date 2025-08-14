
import { pgTable, varchar, uuid, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { feedPosts } from './feed';

export const moderationLogs = pgTable('moderation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  moderatorId: uuid('moderator_id').references(() => profiles.id),
  action: varchar('action').notNull(),
  reason: varchar('reason'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const humanReviewQueue = pgTable('human_review_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }).unique(),
  reason: varchar('reason'),
  status: varchar('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const chatbotThemes = pgTable('chatbot_themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name').notNull(),
  primaryColor: varchar('primary_color'),
  secondaryColor: varchar('secondary_color'),
  fontFamily: varchar('font_family'),
  allowedDomains: jsonb('allowed_domains').default('{"links": []}').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
