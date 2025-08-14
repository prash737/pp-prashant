
import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['student', 'mentor', 'institution']);
export const ageGroupEnum = pgEnum('age_group', [
  'early_childhood',
  'elementary', 
  'middle_school',
  'high_school',
  'young_adult'
]);
export const educationLevelEnum = pgEnum('education_level', [
  'pre_school',
  'school',
  'high_school',
  'undergraduate',
  'graduate',
  'post_graduate',
  'phd'
]);
export const postTypeEnum = pgEnum('post_type', [
  'GENERAL',
  'ACHIEVEMENT',
  'PROJECT',
  'QUESTION',
  'DISCUSSION',
  'TUTORIAL',
  'RESOURCE_SHARE',
  'EVENT_ANNOUNCEMENT'
]);
