
import { pgTable, varchar, uuid, timestamp, integer, boolean, text, doublePrecision, jsonb } from 'drizzle-orm/pg-core';
import { institutionProfiles } from './institutions';

export const institutionGallery = pgTable('institution_gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  imageUrl: varchar('image_url').notNull(),
  caption: varchar('caption'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const institutionFacilities = pgTable('institution_facilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  description: varchar('description').notNull(),
  features: varchar('features').array().notNull(),
  images: varchar('images').array().notNull(),
  learnMoreLink: varchar('learn_more_link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const institutionFaculty = pgTable('institution_faculty', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  title: varchar('title').notNull(),
  department: varchar('department').notNull(),
  image: varchar('image'),
  expertise: varchar('expertise').array().default([]).notNull(),
  email: varchar('email'),
  bio: text('bio'),
  qualifications: varchar('qualifications'),
  experience: varchar('experience'),
  specialization: varchar('specialization'),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const institutionQuickFacts = pgTable('institution_quick_facts', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }).unique(),
  undergraduateStudents: integer('undergraduate_students'),
  graduateStudents: integer('graduate_students'),
  facultyMembers: integer('faculty_members'),
  campusSizeAcres: doublePrecision('campus_size_acres'),
  campusSizeKm2: doublePrecision('campus_size_km2'),
  internationalStudentsCountries: integer('international_students_countries'),
  globalRanking: varchar('global_ranking'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const institutionContactInfo = pgTable('institution_contact_info', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }).unique(),
  address: varchar('address'),
  city: varchar('city'),
  state: varchar('state'),
  country: varchar('country'),
  postalCode: varchar('postal_code'),
  phone: varchar('phone'),
  email: varchar('email'),
  website: varchar('website'),
  socialLinks: jsonb('social_links').default('{}'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const institutionFacultyStats = pgTable('institution_faculty_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }).unique(),
  totalFaculty: integer('total_faculty'),
  studentFacultyRatioStudents: integer('student_faculty_ratio_students'),
  studentFacultyRatioFaculty: integer('student_faculty_ratio_faculty'),
  facultyWithPhdsPercentage: integer('faculty_with_phds_percentage'),
  internationalFacultyPercentage: integer('international_faculty_percentage'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const institutionEvents = pgTable('institution_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(),
  description: varchar('description').notNull(),
  eventType: varchar('event_type').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: varchar('location'),
  imageUrl: varchar('image_url'),
  registrationUrl: varchar('registration_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const institutionPrograms = pgTable('institution_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: varchar('name').notNull(),
  type: varchar('type').notNull(),
  level: varchar('level').notNull(),
  durationValue: integer('duration_value').notNull(),
  durationType: varchar('duration_type').notNull(),
  description: varchar('description').notNull(),
  eligibility: varchar('eligibility'),
  learningOutcomes: varchar('learning_outcomes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});
