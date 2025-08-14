
import { pgTable, uuid, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { skills } from './skills-interests';

export const skillEndorsements = pgTable('skill_endorsements', {
  id: uuid('id').primaryKey().defaultRandom(),
  endorserId: uuid('endorser_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  endorsedUserId: uuid('endorsed_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  comment: varchar('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
