
import { pgTable, uuid, varchar, text, boolean, timestamp, json, integer, serial, date } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const institutionCategories = pgTable('institution_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionTypes = pgTable('institution_types', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').notNull().references(() => institutionCategories.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionProfiles = pgTable('institution_profiles', {
  id: uuid('id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  institutionName: text('institution_name').notNull(),
  institutionType: text('institution_type'),
  institutionTypeId: integer('institution_type_id'),
  website: text('website'),
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),
  overview: text('overview'),
  mission: text('mission'),
  coreValues: json('core_values'),
  verified: boolean('verified').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionGallery = pgTable('institution_gallery', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  caption: text('caption'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const institutionFacilities = pgTable('institution_facilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description').notNull(),
  features: text('features').array(),
  images: text('images').array(),
  learnMoreLink: text('learn_more_link'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionFaculty = pgTable('institution_faculty', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  title: text('title').notNull(),
  department: text('department').notNull(),
  image: text('image'),
  expertise: text('expertise').array().default([]),
  email: text('email'),
  bio: text('bio'),
  qualifications: text('qualifications'),
  experience: text('experience'),
  specialization: text('specialization'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionQuickFacts = pgTable('institution_quick_facts', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().unique().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  undergraduateStudents: integer('undergraduate_students'),
  graduateStudents: integer('graduate_students'),
  facultyMembers: integer('faculty_members'),
  campusSizeAcres: integer('campus_size_acres'),
  campusSizeKm2: integer('campus_size_km2'),
  internationalStudentsCountries: integer('international_students_countries'),
  globalRanking: text('global_ranking'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionContactInfo = pgTable('institution_contact_info', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().unique().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  postalCode: text('postal_code'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  socialLinks: json('social_links').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionFacultyStats = pgTable('institution_faculty_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().unique().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  totalFaculty: integer('total_faculty'),
  studentFacultyRatioStudents: integer('student_faculty_ratio_students'),
  studentFacultyRatioFaculty: integer('student_faculty_ratio_faculty'),
  facultyWithPhdsPercentage: integer('faculty_with_phds_percentage'),
  internationalFacultyPercentage: integer('international_faculty_percentage'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionEvents = pgTable('institution_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  eventType: text('event_type').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  imageUrl: text('image_url'),
  registrationUrl: text('registration_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const institutionPrograms = pgTable('institution_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  institutionId: uuid('institution_id').notNull().references(() => institutionProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  level: text('level').notNull(),
  durationValue: integer('duration_value').notNull(),
  durationType: text('duration_type').notNull(),
  description: text('description').notNull(),
  eligibility: text('eligibility'),
  learningOutcomes: text('learning_outcomes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
