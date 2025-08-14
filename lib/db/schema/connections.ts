
import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const connectionRequests = pgTable('connection_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 255 }).default('pending'),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const connections = pgTable('connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  user1Id: uuid('user1_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  connectionType: varchar('connection_type', { length: 255 }).default('friend'),
  connectedAt: timestamp('connected_at').defaultNow(),
});

export const institutionFollowConnections = pgTable('institution_follow_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  connectedAt: timestamp('connected_at').defaultNow(),
});
