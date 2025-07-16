# PathPiper - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [Technical Architecture](#technical-architecture)
4. [Module Documentation](#module-documentation)
   - [Authentication & Registration](#authentication--registration)
   - [Student Onboarding](#student-onboarding)
   - [Mentor Onboarding](#mentor-onboarding)
   - [Institution Onboarding](#institution-onboarding)
   - [Feed System](#feed-system)
   - [Explore Section](#explore-section)
   - [Circles](#circles)
   - [Profiles](#profiles)
5. [Database Schema](#database-schema)
6. [Security & Privacy](#security--privacy)
7. [Future Enhancements](#future-enhancements)

## Project Overview

PathPiper is an educational platform designed to connect students, mentors, and educational institutions in a safe, engaging environment. The platform aims to guide students on their educational journey by providing personalized learning paths, mentorship opportunities, and connections to relevant educational institutions.

The core mission of PathPiper is to:
- Help students discover and pursue their interests and talents
- Connect students with qualified mentors who can guide their learning journey
- Provide educational institutions a platform to showcase their programs and engage with potential students
- Create a safe, age-appropriate social learning environment

PathPiper is built with Next.js, using the App Router, and leverages Supabase for authentication, database, and real-time functionality. The UI is built with Tailwind CSS and shadcn/ui components.

## Core Features

### For Students
- Personalized profiles showcasing interests, skills, and achievements
- Age-appropriate content filtering
- Connection with mentors and peers
- Educational content discovery
- Goal setting and tracking
- Interactive learning paths

### For Mentors
- Professional profiles highlighting expertise and experience
- Tools to guide and support students
- Availability management for mentoring sessions
- Impact tracking and testimonials

### For Institutions
- Institutional profiles showcasing programs, events, and facilities
- Student recruitment and engagement tools
- Event promotion and management
- Program showcase

### Platform-Wide Features
- Social feed with educational content
- Explore section for discovering people, content, and institutions
- Circles for networking and community building
- Real-time notifications and messaging
- Comprehensive safety features and parental controls

## Technical Architecture

PathPiper is built with the following technologies:

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Authentication**: Supabase Auth with custom flows for age verification
- **State Management**: React Context API and Server Components
- **Animations**: Framer Motion
- **Icons**: Lucide React

The application follows a modern architecture with:
- Server Components for data fetching and rendering
- Client Components for interactive elements
- Server Actions for form submissions and data mutations
- Edge functions for performance-critical operations

## Module Documentation

### Authentication & Registration

The authentication system in PathPiper is designed to be secure, user-friendly, and compliant with regulations regarding minors online.

#### Registration Flow

PathPiper offers three distinct registration paths:

1. **Student Registration**
   - Collects basic information (name, email, password)
   - Age verification with birth date
   - Parental consent flow for users under 16
   - Account verification via email

2. **Mentor Registration**
   - Collects professional information
   - Expertise and skills selection
   - Background verification process
   - Terms and guidelines acceptance

3. **Institution Registration**
   - Institutional details and contact information
   - Verification of institutional status
   - Administrator account setup

#### Technical Implementation

- Supabase Auth for user authentication
- Custom database tables for extended profile information
- Row-Level Security (RLS) policies for data protection
- Server-side validation and security checks
- JWT-based session management

#### Code Structure

- `app/signup/page.tsx`: Main signup page with role selection
- `components/registration/`: Registration components for each user type
- `lib/supabase/auth.ts`: Authentication utilities
- `app/actions/auth-actions.ts`: Server actions for authentication

### Student Onboarding

After registration, students go through a comprehensive onboarding process to personalize their experience.

#### Onboarding Steps

1. **Personal Information**
   - Profile completion with educational background
   - Profile picture upload
   - Basic demographic information

2. **Interests Selection**
   - Selection from curated, age-appropriate interest categories
   - Personalized recommendations based on selections

3. **Goals Setting**
   - Educational and personal development goals
   - Timeframe selection (short-term, medium-term, long-term)
   - Goal categorization

4. **Skills Assessment**
   - Self-assessment of current skill levels
   - Identification of skills to develop

#### Technical Implementation

- Multi-step form with state persistence
- Age-appropriate content filtering
- Interactive UI elements for selection
- Progress tracking

#### Code Structure

- `app/onboarding/page.tsx`: Main onboarding page
- `components/onboarding/`: Step components
- `data/age-appropriate-content.ts`: Age-filtered content definitions

### Mentor Onboarding

Mentors go through a specialized onboarding process focused on their professional background and mentoring capabilities.

#### Onboarding Steps

1. **Personal Information**
   - Professional background
   - Profile picture and credentials
   - Contact information

2. **Expertise Definition**
   - Subject areas and specializations
   - Skill levels and certifications
   - Teaching methodologies

3. **Experience Documentation**
   - Previous mentoring or teaching experience
   - Educational background
   - Professional achievements

4. **Availability Settings**
   - Mentoring time availability
   - Session duration preferences
   - Number of mentees willing to support

#### Technical Implementation

- Professional verification system
- Calendar integration for availability
- Expertise tagging system

#### Code Structure

- `app/mentor-onboarding/page.tsx`: Main mentor onboarding page
- `components/onboarding/mentor/`: Mentor-specific step components

### Institution Onboarding

Educational institutions have a dedicated onboarding flow to showcase their offerings and connect with potential students.

#### Onboarding Steps

1. **Institution Information**
   - Basic details and contact information
   - Location and type of institution
   - Mission statement and overview

2. **Programs Showcase**
   - Academic programs and courses
   - Special initiatives and opportunities
   - Admission requirements

3. **Events Calendar**
   - Upcoming events and open houses
   - Application deadlines
   - Special programs and workshops

4. **Gallery Setup**
   - Campus photos and videos
   - Facility showcases
   - Student life highlights

#### Technical Implementation

- Rich media management for galleries
- Event calendar system
- Program categorization and search optimization

#### Code Structure

- `app/institution-onboarding/page.tsx`: Main institution onboarding page
- `components/onboarding/institution/`: Institution-specific step components

### Feed System

The feed is the central hub for content discovery and social interaction on PathPiper.

#### Features

1. **Personalized Content**
   - Algorithm-based content recommendations
   - Age-appropriate filtering
   - Interest-based suggestions

2. **Post Types**
   - Educational content
   - Questions and discussions
   - Achievements and milestones
   - Events and opportunities

3. **Interaction Options**
   - Comments and discussions
   - Likes and saves
   - Sharing functionality

4. **Content Filtering**
   - Topic-based filters
   - Source filters (mentors, institutions, peers)
   - Content type filters

#### Technical Implementation

- Real-time updates with Supabase Realtime
- Content moderation system
- Engagement analytics

#### Code Structure

- `app/feed/page.tsx`: Main feed page
- `components/feed/`: Feed components
- `lib/supabase/feed.ts`: Feed data utilities

### Explore Section

The explore section allows users to discover new connections, content, and opportunities.

#### Features

1. **Discovery Categories**
   - People (students and mentors)
   - Institutions
   - Topics and subjects
   - Events and programs

2. **Search Functionality**
   - Advanced filtering options
   - Keyword search
   - Location-based search

3. **Recommendations**
   - Personalized suggestions
   - Trending content and connections
   - Featured opportunities

#### Technical Implementation

- Search indexing and optimization
- Recommendation algorithms
- Category management system

#### Code Structure

- `app/explore/page.tsx`: Main explore page
- `components/explore/`: Explore components
- `app/explore/explore.css`: Explore-specific styles

### Circles

Circles represent the social networking aspect of PathPiper, allowing users to build communities and connections.

#### Features

1. **Connection Types**
   - Peer connections (student-to-student)
   - Mentorship connections
   - Institutional affiliations
   - Interest-based groups

2. **Circle Management**
   - Connection requests and approvals
   - Group creation and joining
   - Privacy settings

3. **Interaction Tools**
   - Activity feeds for circles
   - Shared resources
   - Discussion spaces

#### Technical Implementation

- Connection graph database structure
- Privacy and permission systems
- Activity tracking

#### Code Structure

- `components/profile/circle-view.tsx`: Circle visualization and management
- `components/profile/mentor-circle-view.tsx`: Mentor-specific circle view

### Profiles

Profiles are the personal or institutional spaces that showcase identity, achievements, and offerings.

#### Types of Profiles

1. **Student Profiles**
   - Personal information and interests
   - Skills visualization
   - Achievement timeline
   - Learning path visualization
   - Projects showcase

2. **Mentor Profiles**
   - Professional background
   - Expertise areas
   - Mentorship history
   - Availability calendar
   - Testimonials

3. **Institution Profiles**
   - Institutional overview
   - Programs and courses
   - Faculty highlights
   - Facilities showcase
   - Events calendar
   - Gallery

#### Technical Implementation

- Dynamic profile components based on user type
- Media management for profile assets
- Privacy controls and visibility settings

#### Code Structure

- `app/student/profile/page.tsx`: Student profile page
- `app/mentor/profile/page.tsx`: Mentor profile page
- `app/institution/profile/page.tsx`: Institution profile page
- `components/profile/`: Shared and type-specific profile components

## Database Schema

PathPiper uses a PostgreSQL database through Supabase with the following key tables:

### Authentication Tables
- `auth.users`: Managed by Supabase Auth
- `profiles`: Core user information linked to auth.users
- `student_profiles`: Student-specific profile information
- `mentor_profiles`: Mentor-specific profile information
- `institution_profiles`: Institution-specific profile information

### Content Tables
- `feed_posts`: Posts for the feed system
- `comments`: Comments on feed posts
- `likes`: Like interactions on content

### Educational Tables
- `goals`: User goals and progress
- `skills`: User skills and proficiency levels
- `interests`: User interests and preferences
- `learning_paths`: Structured learning journeys

### Institutional Tables
- `institution_events`: Events hosted by institutions
- `institution_programs`: Programs offered by institutions
- `institution_gallery`: Media showcasing institutions

### Connection Tables
- `connections`: User-to-user connections
- `circles`: Groups and communities
- `circle_members`: Membership in circles

## Security & Privacy

PathPiper implements comprehensive security and privacy measures:

### Data Protection
- Row-Level Security (RLS) policies for all database tables
- Data encryption for sensitive information
- Secure file storage with access controls

### Age-Appropriate Safety
- Content filtering based on age groups
- Parental consent and monitoring for users under 16
- Reporting and moderation systems

### Privacy Controls
- Granular visibility settings for profile information
- Opt-in communication preferences
- Data minimization principles

## Future Enhancements

Planned future enhancements for PathPiper include:

1. **Advanced Learning Tools**
   - Interactive quizzes and assessments
   - Progress tracking and analytics
   - Personalized learning recommendations

2. **Expanded Mentorship Features**
   - Scheduling and booking system
   - Video conferencing integration
   - Resource sharing and assignment tools

3. **Enhanced Institution Tools**
   - Application management
   - Virtual tours
   - Alumni networking

4. **Mobile Applications**
   - Native iOS and Android apps
   - Offline functionality
   - Push notifications

5. **AI-Powered Features**
   - Learning style assessment
   - Content recommendations
   - Skill gap analysis
