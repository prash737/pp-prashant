
import { pgTable, varchar, uuid, timestamp, boolean } from 'drizzle-orm/pg-core';

export const parentProfiles = pgTable('parent_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email').notNull(),
  name: varchar('name').notNull(),
  authId: uuid('auth_id'),
  verificationToken: varchar('verification_token'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
