import { pgTable, uuid, varchar, text, timestamp, integer, serial } from 'drizzle-orm/pg-core';
import { ageGroupEnum } from './enums';
import { profiles } from './profiles';
import { createTable } from 'drizzle-orm/sqlite-core';
import { skillProficiencyEnum } from './enums';

export const interestCategories = pgTable('interest_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const interests = pgTable('interests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: integer('category_id').notNull().references(() => interestCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Interests Junction Table
export const userInterests = pgTable('user_interests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  interestId: integer('interest_id').notNull().references(() => interests.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const skillCategories = pgTable('skill_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ageGroup: ageGroupEnum('age_group').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: integer('category_id').notNull().references(() => skillCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Skills Junction Table  
export const userSkills = pgTable('user_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const skillEndorsements = pgTable('skill_endorsements', {
  id: uuid('id').primaryKey().defaultRandom(),
  endorserId: uuid('endorser_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  endorsedUserId: uuid('endorsed_user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  skillId: integer('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  code: text('code').unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userLanguages = pgTable('user_languages', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  languageId: integer('language_id').notNull().references(() => languages.id, { onDelete: 'cascade' }),
  proficiencyLevel: varchar('proficiency_level', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const hobbies = pgTable('hobbies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userHobbies = pgTable('user_hobbies', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  hobbyId: integer('hobby_id').notNull().references(() => hobbies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});