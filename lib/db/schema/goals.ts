import { pgTable, varchar, uuid, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const goals = pgTable('goals', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  description: varchar('description'),
  category: varchar('category'),
  timeframe: varchar('timeframe'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});