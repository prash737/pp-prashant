
import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { institutionProfiles } from './institutions';

export const circleBadges = pgTable('circle_badges', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 20 }).default('#3B82F6'),
  icon: varchar('icon', { length: 50 }).default('users'),
  isDefault: boolean('is_default').default(false),
  isDisabled: boolean('is_disabled').default(false),
  isCreatorDisabled: boolean('is_creator_disabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const circleMemberships = pgTable('circle_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  circleId: uuid('circle_id').notNull().references(() => circleBadges.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 255 }).default('active'),
  joinedAt: timestamp('joined_at').defaultNow(),
  isDisabledMember: boolean('is_disabled_member').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const circleInvitations = pgTable('circle_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  circleId: uuid('circle_id').notNull().references(() => circleBadges.id, { onDelete: 'cascade' }),
  inviterId: uuid('inviter_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  inviteeId: uuid('invitee_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 255 }).default('pending'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const academicCommunities = pgTable('academic_communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  iconUrl: text('icon_url'),
  isPrivate: boolean('is_private').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const academicCommunityMembers = pgTable('academic_community_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => academicCommunities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 255 }).default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
