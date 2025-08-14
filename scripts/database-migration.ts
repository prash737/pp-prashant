
#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import * as schema from '../lib/db/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

interface MigrationConfig {
  batchSize: number;
  enableLogging: boolean;
  dryRun: boolean;
  preserveData: boolean;
  enableRollback: boolean;
}

interface MigrationStats {
  tablesProcessed: number;
  recordsMigrated: number;
  errorsEncountered: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

class DatabaseMigrator {
  private prisma: PrismaClient;
  private drizzle: ReturnType<typeof drizzle>;
  private config: MigrationConfig;
  private stats: MigrationStats;
  private logFile: string;

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      batchSize: 1000,
      enableLogging: true,
      dryRun: false,
      preserveData: true,
      enableRollback: true,
      ...config
    };

    this.stats = {
      tablesProcessed: 0,
      recordsMigrated: 0,
      errorsEncountered: 0,
      startTime: new Date()
    };

    this.logFile = `migration-${Date.now()}.log`;
    
    // Initialize clients
    this.prisma = new PrismaClient();
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10
    });
    this.drizzle = drizzle(pool, { schema });
  }

  private async log(message: string, level: 'INFO' | 'ERROR' | 'WARN' = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    
    if (this.config.enableLogging) {
      console.log(logMessage.trim());
      await fs.appendFile(path.join(__dirname, 'logs', this.logFile), logMessage);
    }
  }

  private async createBackup() {
    if (!this.config.enableRollback) return;

    await this.log('Creating database backup for rollback...');
    
    try {
      // Create backup of critical tables
      const backupQueries = [
        'CREATE TABLE IF NOT EXISTS backup_profiles AS SELECT * FROM profiles;',
        'CREATE TABLE IF NOT EXISTS backup_feed_posts AS SELECT * FROM feed_posts;',
        'CREATE TABLE IF NOT EXISTS backup_connections AS SELECT * FROM connections;',
        'CREATE TABLE IF NOT EXISTS backup_student_profiles AS SELECT * FROM student_profiles;',
        'CREATE TABLE IF NOT EXISTS backup_institution_profiles AS SELECT * FROM institution_profiles;'
      ];

      for (const query of backupQueries) {
        await this.drizzle.execute(sql.raw(query));
      }

      await this.log('Backup created successfully');
    } catch (error) {
      await this.log(`Backup creation failed: ${error}`, 'ERROR');
      throw error;
    }
  }

  private async migrateProfiles() {
    await this.log('Migrating profiles table...');
    
    const profiles = await this.prisma.profile.findMany({
      include: {
        student: true,
        mentor: true,
        institution: true
      }
    });

    let migratedCount = 0;
    for (let i = 0; i < profiles.length; i += this.config.batchSize) {
      const batch = profiles.slice(i, i + this.config.batchSize);
      
      if (!this.config.dryRun) {
        try {
          await this.drizzle.insert(schema.profiles).values(
            batch.map(profile => ({
              id: profile.id,
              role: profile.role as any,
              firstName: profile.firstName,
              lastName: profile.lastName,
              bio: profile.bio,
              location: profile.location,
              profileImageUrl: profile.profileImageUrl,
              tagline: profile.tagline,
              professionalSummary: profile.professionalSummary,
              verificationStatus: profile.verificationStatus,
              email: profile.email,
              emailVerified: profile.emailVerified,
              phone: profile.phone,
              coverImageUrl: profile.coverImageUrl,
              themePreference: profile.themePreference,
              timezone: profile.timezone,
              availabilityStatus: profile.availabilityStatus,
              lastActiveDate: profile.lastActiveDate,
              profileViews: profile.profileViews,
              parentId: profile.parentId,
              parentVerified: profile.parentVerified,
              createdAt: profile.createdAt,
              updatedAt: profile.updatedAt
            }))
          ).onConflictDoNothing();

          migratedCount += batch.length;
        } catch (error) {
          await this.log(`Error migrating profiles batch: ${error}`, 'ERROR');
          this.stats.errorsEncountered++;
        }
      }
    }

    await this.log(`Profiles migration completed: ${migratedCount} records`);
    this.stats.recordsMigrated += migratedCount;
    this.stats.tablesProcessed++;
  }

  private async migratePosts() {
    await this.log('Migrating feed posts...');
    
    const posts = await this.prisma.feedPost.findMany();
    let migratedCount = 0;

    for (let i = 0; i < posts.length; i += this.config.batchSize) {
      const batch = posts.slice(i, i + this.config.batchSize);
      
      if (!this.config.dryRun) {
        try {
          await this.drizzle.insert(schema.feedPosts).values(
            batch.map(post => ({
              id: post.id,
              userId: post.userId,
              content: post.content,
              imageUrl: post.imageUrl,
              linkPreview: post.linkPreview as any,
              likesCount: post.likesCount,
              commentsCount: post.commentsCount,
              sharesCount: post.sharesCount,
              isTrail: post.isTrail,
              parentPostId: post.parentPostId,
              trailOrder: post.trailOrder,
              postType: post.postType as any,
              tags: post.tags,
              subjects: post.subjects,
              ageGroup: post.ageGroup,
              difficultyLevel: post.difficultyLevel,
              isQuestion: post.isQuestion,
              isAchievement: post.isAchievement,
              achievementType: post.achievementType,
              projectCategory: post.projectCategory,
              moderationStatus: post.moderationStatus,
              viewsCount: post.viewsCount,
              engagementScore: post.engagementScore,
              isPinned: post.isPinned,
              isPromoted: post.isPromoted,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt
            }))
          ).onConflictDoNothing();

          migratedCount += batch.length;
        } catch (error) {
          await this.log(`Error migrating posts batch: ${error}`, 'ERROR');
          this.stats.errorsEncountered++;
        }
      }
    }

    await this.log(`Posts migration completed: ${migratedCount} records`);
    this.stats.recordsMigrated += migratedCount;
    this.stats.tablesProcessed++;
  }

  private async migrateConnections() {
    await this.log('Migrating connections...');
    
    // Migrate connection requests
    const connectionRequests = await this.prisma.connectionRequest.findMany();
    let migratedRequests = 0;

    for (let i = 0; i < connectionRequests.length; i += this.config.batchSize) {
      const batch = connectionRequests.slice(i, i + this.config.batchSize);
      
      if (!this.config.dryRun) {
        try {
          await this.drizzle.insert(schema.connectionRequests).values(
            batch.map(req => ({
              id: req.id,
              senderId: req.senderId,
              receiverId: req.receiverId,
              status: req.status,
              message: req.message,
              createdAt: req.createdAt,
              updatedAt: req.updatedAt
            }))
          ).onConflictDoNothing();

          migratedRequests += batch.length;
        } catch (error) {
          await this.log(`Error migrating connection requests: ${error}`, 'ERROR');
          this.stats.errorsEncountered++;
        }
      }
    }

    // Migrate actual connections
    const connections = await this.prisma.connection.findMany();
    let migratedConnections = 0;

    for (let i = 0; i < connections.length; i += this.config.batchSize) {
      const batch = connections.slice(i, i + this.config.batchSize);
      
      if (!this.config.dryRun) {
        try {
          await this.drizzle.insert(schema.connections).values(
            batch.map(conn => ({
              id: conn.id,
              user1Id: conn.user1Id,
              user2Id: conn.user2Id,
              connectionType: conn.connectionType,
              connectedAt: conn.connectedAt
            }))
          ).onConflictDoNothing();

          migratedConnections += batch.length;
        } catch (error) {
          await this.log(`Error migrating connections: ${error}`, 'ERROR');
          this.stats.errorsEncountered++;
        }
      }
    }

    await this.log(`Connections migration completed: ${migratedRequests} requests, ${migratedConnections} connections`);
    this.stats.recordsMigrated += migratedRequests + migratedConnections;
    this.stats.tablesProcessed += 2;
  }

  private async migrateStudentProfiles() {
    await this.log('Migrating student profiles...');
    
    const studentProfiles = await this.prisma.studentProfile.findMany({
      include: {
        educationHistory: true
      }
    });

    let migratedCount = 0;
    for (let i = 0; i < studentProfiles.length; i += this.config.batchSize) {
      const batch = studentProfiles.slice(i, i + this.config.batchSize);
      
      if (!this.config.dryRun) {
        try {
          await this.drizzle.insert(schema.studentProfiles).values(
            batch.map(student => ({
              id: student.id,
              ageGroup: student.age_group as any,
              educationLevel: student.educationLevel as any,
              birthMonth: student.birthMonth,
              birthYear: student.birthYear,
              personalityType: student.personalityType,
              learningStyle: student.learningStyle,
              favoriteQuote: student.favoriteQuote,
              onboardingCompleted: student.onboardingCompleted,
              createdAt: student.createdAt,
              updatedAt: student.updatedAt
            }))
          ).onConflictDoNothing();

          // Migrate education history
          for (const student of batch) {
            if (student.educationHistory.length > 0) {
              await this.drizzle.insert(schema.studentEducationHistory).values(
                student.educationHistory.map(edu => ({
                  id: edu.id,
                  studentId: edu.studentId,
                  institutionId: edu.institutionId,
                  institutionName: edu.institutionName,
                  institutionTypeId: edu.institutionTypeId,
                  degreeProgram: edu.degreeProgram,
                  fieldOfStudy: edu.fieldOfStudy,
                  subjects: edu.subjects as any,
                  startDate: edu.startDate,
                  endDate: edu.endDate,
                  isCurrent: edu.isCurrent,
                  gradeLevel: edu.gradeLevel,
                  gpa: edu.gpa,
                  achievements: edu.achievements,
                  description: edu.description,
                  institutionVerified: edu.institutionVerified,
                  createdAt: edu.createdAt,
                  updatedAt: edu.updatedAt
                }))
              ).onConflictDoNothing();
            }
          }

          migratedCount += batch.length;
        } catch (error) {
          await this.log(`Error migrating student profiles: ${error}`, 'ERROR');
          this.stats.errorsEncountered++;
        }
      }
    }

    await this.log(`Student profiles migration completed: ${migratedCount} records`);
    this.stats.recordsMigrated += migratedCount;
    this.stats.tablesProcessed++;
  }

  private async migrateInstitutionData() {
    await this.log('Migrating institution data...');
    
    // Migrate institution profiles
    const institutions = await this.prisma.institutionProfile.findMany({
      include: {
        gallery: true,
        facilities: true,
        faculty: true,
        events: true,
        programs: true,
        quickFacts: true,
        contactInfo: true,
        facultyStats: true
      }
    });

    let migratedCount = 0;
    for (const institution of institutions) {
      if (!this.config.dryRun) {
        try {
          // Migrate main institution profile
          await this.drizzle.insert(schema.institutionProfiles).values({
            id: institution.id,
            institutionName: institution.institutionName,
            institutionType: institution.institutionType,
            institutionTypeId: institution.institutionTypeId,
            website: institution.website,
            logoUrl: institution.logoUrl,
            coverImageUrl: institution.coverImageUrl,
            overview: institution.overview,
            mission: institution.mission,
            coreValues: institution.coreValues as any,
            verified: institution.verified,
            onboardingCompleted: institution.onboardingCompleted,
            createdAt: institution.createdAt,
            updatedAt: institution.updatedAt
          }).onConflictDoNothing();

          // Migrate related data
          if (institution.gallery.length > 0) {
            await this.drizzle.insert(schema.institutionGallery).values(
              institution.gallery.map(item => ({
                id: item.id,
                institutionId: item.institutionId,
                imageUrl: item.imageUrl,
                caption: item.caption,
                createdAt: item.createdAt
              }))
            ).onConflictDoNothing();
          }

          if (institution.facilities.length > 0) {
            await this.drizzle.insert(schema.institutionFacilities).values(
              institution.facilities.map(facility => ({
                id: facility.id,
                institutionId: facility.institutionId,
                name: facility.name,
                description: facility.description,
                features: facility.features,
                images: facility.images,
                learnMoreLink: facility.learnMoreLink,
                createdAt: facility.createdAt,
                updatedAt: facility.updatedAt
              }))
            ).onConflictDoNothing();
          }

          if (institution.faculty.length > 0) {
            await this.drizzle.insert(schema.institutionFaculty).values(
              institution.faculty.map(faculty => ({
                id: faculty.id,
                institutionId: faculty.institutionId,
                name: faculty.name,
                title: faculty.title,
                department: faculty.department,
                image: faculty.image,
                expertise: faculty.expertise,
                email: faculty.email,
                bio: faculty.bio,
                qualifications: faculty.qualifications,
                experience: faculty.experience,
                specialization: faculty.specialization,
                featured: faculty.featured,
                createdAt: faculty.createdAt,
                updatedAt: faculty.updatedAt
              }))
            ).onConflictDoNothing();
          }

          if (institution.quickFacts) {
            await this.drizzle.insert(schema.institutionQuickFacts).values({
              id: institution.quickFacts.id,
              institutionId: institution.quickFacts.institutionId,
              undergraduateStudents: institution.quickFacts.undergraduateStudents,
              graduateStudents: institution.quickFacts.graduateStudents,
              facultyMembers: institution.quickFacts.facultyMembers,
              campusSizeAcres: institution.quickFacts.campusSizeAcres,
              campusSizeKm2: institution.quickFacts.campusSizeKm2,
              internationalStudentsCountries: institution.quickFacts.internationalStudentsCountries,
              globalRanking: institution.quickFacts.globalRanking,
              createdAt: institution.quickFacts.createdAt,
              updatedAt: institution.quickFacts.updatedAt
            }).onConflictDoNothing();
          }

          migratedCount++;
        } catch (error) {
          await this.log(`Error migrating institution ${institution.id}: ${error}`, 'ERROR');
          this.stats.errorsEncountered++;
        }
      }
    }

    await this.log(`Institution data migration completed: ${migratedCount} institutions`);
    this.stats.recordsMigrated += migratedCount;
    this.stats.tablesProcessed++;
  }

  private async validateMigration() {
    await this.log('Validating migration integrity...');
    
    const validations = [
      {
        name: 'profiles_count',
        prismaCount: await this.prisma.profile.count(),
        drizzleCount: await this.drizzle.select({ count: sql`count(*)` }).from(schema.profiles)
      },
      {
        name: 'posts_count',
        prismaCount: await this.prisma.feedPost.count(),
        drizzleCount: await this.drizzle.select({ count: sql`count(*)` }).from(schema.feedPosts)
      },
      {
        name: 'connections_count',
        prismaCount: await this.prisma.connection.count(),
        drizzleCount: await this.drizzle.select({ count: sql`count(*)` }).from(schema.connections)
      }
    ];

    let validationsPassed = 0;
    for (const validation of validations) {
      const drizzleCount = validation.drizzleCount[0]?.count || 0;
      if (validation.prismaCount === Number(drizzleCount)) {
        await this.log(`✅ ${validation.name}: ${validation.prismaCount} records match`);
        validationsPassed++;
      } else {
        await this.log(`❌ ${validation.name}: Prisma(${validation.prismaCount}) != Drizzle(${drizzleCount})`, 'ERROR');
      }
    }

    await this.log(`Validation completed: ${validationsPassed}/${validations.length} checks passed`);
    return validationsPassed === validations.length;
  }

  async executeMigration() {
    try {
      await this.log('🚀 Starting database migration from Prisma to Drizzle...');
      
      // Create logs directory
      await fs.mkdir(path.join(__dirname, 'logs'), { recursive: true });
      
      // Step 1: Create backup
      await this.createBackup();
      
      // Step 2: Migrate core tables
      await this.migrateProfiles();
      await this.migratePosts();
      await this.migrateConnections();
      await this.migrateStudentProfiles();
      await this.migrateInstitutionData();
      
      // Step 3: Validate migration
      const isValid = await this.validateMigration();
      
      // Step 4: Finalize
      this.stats.endTime = new Date();
      this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime();
      
      await this.log('📊 Migration Summary:');
      await this.log(`   Tables Processed: ${this.stats.tablesProcessed}`);
      await this.log(`   Records Migrated: ${this.stats.recordsMigrated}`);
      await this.log(`   Errors Encountered: ${this.stats.errorsEncountered}`);
      await this.log(`   Duration: ${Math.round(this.stats.duration / 1000)}s`);
      await this.log(`   Validation: ${isValid ? 'PASSED' : 'FAILED'}`);
      
      if (isValid) {
        await this.log('✅ Migration completed successfully!');
      } else {
        await this.log('❌ Migration completed with validation errors', 'ERROR');
      }

    } catch (error) {
      await this.log(`💥 Migration failed: ${error}`, 'ERROR');
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const batchSize = parseInt(args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1] || '1000');
  
  console.log('🔄 Initializing Database Migration...');
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
  console.log(`   Batch Size: ${batchSize}`);
  
  const migrator = new DatabaseMigrator({
    dryRun,
    batchSize,
    enableLogging: true,
    preserveData: true,
    enableRollback: true
  });

  await migrator.executeMigration();
}

if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseMigrator };
