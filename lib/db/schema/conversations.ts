
import { pgTable, uuid, timestamp, text, boolean } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  user1Id: uuid('user1_id').references(() => profiles.id, { onDelete: 'cascade' }),
  user2Id: uuid('user2_id').references(() => profiles.id, { onDelete: 'cascade' }),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
})

export const messageHistory = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').references(() => profiles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('text'),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})
