
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const parentProfiles = pgTable('parent_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  authId: uuid('auth_id'),
  verificationToken: text('verification_token'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatbotThemes = pgTable('chatbot_themes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  primaryColor: text('primary_color'),
  secondaryColor: text('secondary_color'),
  fontFamily: text('font_family'),
  allowedDomains: text('allowed_domains').default('{"links": []}'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const moderationLogs = pgTable('moderation_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  moderatorId: uuid('moderator_id').references(() => profiles.id),
  action: text('action').notNull(),
  reason: text('reason'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const humanReviewQueue = pgTable('human_review_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().unique(),
  reason: text('reason'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
