
// This file exports the userInterests table definition for the database schema

import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core'
import { profiles } from './schema/profiles'
import { interests } from './schema/skills-interests'

export const userInterests = pgTable('user_interests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  interestId: uuid('interest_id').references(() => interests.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

// Re-export all other schema tables from the index
export * from './schema'
