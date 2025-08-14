
import { pgTable, varchar, uuid, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { institutionProfiles } from './institutions';

export const institutionFollowConnections = pgTable('institution_follow_connections', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  senderId: uuid('sender_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  connectedAt: timestamp('connected_at').defaultNow().notNull()
});

export const academicCommunities = pgTable('academic_communities', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: varchar('description'),
  iconUrl: varchar('icon_url'),
  isPrivate: boolean('is_private').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const academicCommunityMembers = pgTable('academic_community_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  communityId: uuid('community_id').notNull().references(() => academicCommunities.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: varchar('role').default('member').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
