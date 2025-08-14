
import { pgTable, uuid, varchar, text, boolean, timestamp, integer, real } from 'drizzle-orm/pg-core';
import { postTypeEnum } from './enums';
import { profiles } from './profiles';

export const feedPosts = pgTable('feed_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  linkPreview: text('link_preview'),
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  sharesCount: integer('shares_count').default(0),
  isTrail: boolean('is_trail').default(false),
  parentPostId: uuid('parent_post_id'),
  trailOrder: integer('trail_order'),
  postType: postTypeEnum('post_type').default('GENERAL'),
  tags: text('tags').array().default([]),
  subjects: text('subjects').array().default([]),
  ageGroup: varchar('age_group', { length: 255 }),
  difficultyLevel: varchar('difficulty_level', { length: 255 }),
  isQuestion: boolean('is_question').default(false),
  isAchievement: boolean('is_achievement').default(false),
  achievementType: varchar('achievement_type', { length: 255 }),
  projectCategory: varchar('project_category', { length: 255 }),
  moderationStatus: varchar('moderation_status', { length: 255 }).default('approved'),
  viewsCount: integer('views_count').default(0),
  engagementScore: real('engagement_score').default(0),
  isPinned: boolean('is_pinned').default(false),
  isPromoted: boolean('is_promoted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const postLikes = pgTable('post_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postComments = pgTable('post_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const postBookmarks = pgTable('post_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const postReactions = pgTable('post_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => feedPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  reactionType: varchar('reaction_type', { length: 20 }).default('like'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
