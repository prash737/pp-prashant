
import { pgTable, uuid, varchar, text, boolean, timestamp, json, date } from 'drizzle-orm/pg-core';
import { ageGroupEnum, educationLevelEnum } from './enums';
import { profiles } from './profiles';

export const studentProfiles = pgTable('student_profiles', {
  id: uuid('id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  ageGroup: ageGroupEnum('age_group'),
  educationLevel: educationLevelEnum('education_level').notNull(),
  birthMonth: varchar('birth_month', { length: 255 }),
  birthYear: varchar('birth_year', { length: 255 }),
  personalityType: varchar('personality_type', { length: 255 }),
  learningStyle: varchar('learning_style', { length: 255 }),
  favoriteQuote: varchar('favorite_quote', { length: 255 }),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const studentEducationHistory = pgTable('student_education_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => studentProfiles.id, { onDelete: 'cascade' }),
  institutionId: uuid('institution_id'),
  institutionName: text('institution_name').notNull(),
  institutionTypeId: uuid('institution_type_id'),
  degreeProgram: text('degree_program'),
  fieldOfStudy: text('field_of_study'),
  subjects: json('subjects').default([]),
  startDate: date('start_date'),
  endDate: date('end_date'),
  isCurrent: boolean('is_current').default(false),
  gradeLevel: varchar('grade_level', { length: 255 }),
  gpa: varchar('gpa', { length: 255 }),
  achievements: text('achievements'),
  description: text('description'),
  institutionVerified: boolean('institution_verified'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
