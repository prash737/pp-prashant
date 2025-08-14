
import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  role: userRoleEnum('role').notNull(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  bio: text('bio'),
  location: varchar('location', { length: 255 }),
  profileImageUrl: varchar('profile_image_url', { length: 500 }),
  tagline: varchar('tagline', { length: 255 }),
  professionalSummary: text('professional_summary'),
  verificationStatus: boolean('verification_status').default(false),
  email: varchar('email', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  phone: varchar('phone', { length: 50 }),
  coverImageUrl: varchar('cover_image_url', { length: 500 }),
  themePreference: varchar('theme_preference', { length: 50 }).default('default'),
  timezone: varchar('timezone', { length: 100 }),
  availabilityStatus: varchar('availability_status', { length: 50 }).default('online'),
  lastActiveDate: timestamp('last_active_date').defaultNow(),
  profileViews: integer('profile_views').default(0),
  parentId: uuid('parent_id'),
  parentVerified: boolean('parent_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
