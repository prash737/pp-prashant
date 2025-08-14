
import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const mentorProfiles = pgTable('mentor_profiles', {
  id: uuid('id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  profession: text('profession').notNull(),
  organization: text('organization'),
  yearsExperience: integer('years_experience'),
  verified: boolean('verified').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  hoursPerWeek: integer('hours_per_week').default(5),
  maxMentees: integer('max_mentees').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
