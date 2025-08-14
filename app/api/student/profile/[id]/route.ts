
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { createClient } from '@supabase/supabase-js'
import { eq, and, desc } from 'drizzle-orm'
import { 
  profiles, 
  studentProfiles, 
  studentEducationHistory,
  userInterests,
  userSkills,
  interests,
  skills,
  interestCategories,
  skillCategories,
  socialLinks,
  customBadges,
  goals,
  achievements,
  moodBoard,
  connections,
  institutionTypes,
  institutionCategories
} from '@/lib/db/schema'
import { performanceMonitor } from '@/lib/performance-monitor'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const monitor = performanceMonitor;
  monitor.startMonitoring('STUDENT_PROFILE_API');

  try {
    monitor.startPhase('PARAMS_RESOLUTION');
    const resolvedParams = await params;
    const studentId = resolvedParams.id;
    monitor.endPhase('PARAMS_RESOLUTION');

    // Authentication Phase - Optimized
    monitor.startPhase('AUTHENTICATION');
    
    const cookieStore = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    );

    const accessToken = cookies['sb-access-token'];
    if (!accessToken) {
      monitor.log('AUTH_ERROR', 'AUTHENTICATION', { error: 'No access token' });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      monitor.log('AUTH_ERROR', 'AUTHENTICATION', { error: authError?.message });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    monitor.endPhase('AUTHENTICATION');

    // Permission Check Phase - Optimized with single query
    monitor.startPhase('PERMISSION_CHECK');
    
    // Combined permission check - get both current user and target profile in parallel
    const [currentUserProfile, targetProfile] = await Promise.all([
      db.select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1),
      db.select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.id, studentId))
        .limit(1)
    ]);

    if (!currentUserProfile[0] || !['student', 'institution', 'mentor'].includes(currentUserProfile[0].role)) {
      monitor.log('PERMISSION_ERROR', 'PERMISSION_CHECK', { 
        error: 'Invalid role',
        role: currentUserProfile[0]?.role 
      });
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!targetProfile[0]) {
      monitor.log('PERMISSION_ERROR', 'PERMISSION_CHECK', { error: 'Profile not found' });
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (targetProfile[0].role !== 'student') {
      monitor.log('PERMISSION_ERROR', 'PERMISSION_CHECK', { 
        error: 'Not a student profile',
        role: targetProfile[0].role 
      });
      return NextResponse.json({ error: 'Profile is not a student profile' }, { status: 403 })
    }

    monitor.endPhase('PERMISSION_CHECK');

    // Main Data Fetch Phase - Optimized with parallel queries
    monitor.startPhase('DATA_FETCH');

    const isOwnProfile = studentId === user.id;

    // Execute all queries in parallel for maximum performance
    const [
      profileData,
      studentData,
      educationData,
      interestsData,
      skillsData,
      socialLinksData,
      customBadgesData,
      goalsData,
      achievementsData,
      moodBoardData,
      connectionsData
    ] = await Promise.all([
      // Basic profile data
      db.select({
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        bio: profiles.bio,
        location: profiles.location,
        profileImageUrl: profiles.profileImageUrl,
        coverImageUrl: profiles.coverImageUrl,
        verificationStatus: profiles.verificationStatus,
        role: profiles.role
      })
      .from(profiles)
      .where(eq(profiles.id, studentId))
      .limit(1),

      // Student profile data
      db.select({
        id: studentProfiles.id,
        ageGroup: studentProfiles.ageGroup,
        educationLevel: studentProfiles.educationLevel,
        birthMonth: studentProfiles.birthMonth,
        birthYear: studentProfiles.birthYear,
        personalityType: studentProfiles.personalityType,
        learningStyle: studentProfiles.learningStyle,
        favoriteQuote: studentProfiles.favoriteQuote
      })
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentId))
      .limit(1),

      // Education history with institution types
      db.select({
        id: studentEducationHistory.id,
        institutionName: studentEducationHistory.institutionName,
        institutionTypeId: studentEducationHistory.institutionTypeId,
        institutionTypeName: institutionTypes.name,
        institutionCategoryName: institutionCategories.name,
        degreeProgram: studentEducationHistory.degreeProgram,
        fieldOfStudy: studentEducationHistory.fieldOfStudy,
        subjects: studentEducationHistory.subjects,
        startDate: studentEducationHistory.startDate,
        endDate: studentEducationHistory.endDate,
        isCurrent: studentEducationHistory.isCurrent,
        gradeLevel: studentEducationHistory.gradeLevel,
        gpa: studentEducationHistory.gpa,
        achievements: studentEducationHistory.achievements,
        description: studentEducationHistory.description,
        institutionVerified: studentEducationHistory.institutionVerified
      })
      .from(studentEducationHistory)
      .leftJoin(institutionTypes, eq(studentEducationHistory.institutionTypeId, institutionTypes.id))
      .leftJoin(institutionCategories, eq(institutionTypes.categoryId, institutionCategories.id))
      .where(eq(studentEducationHistory.studentId, studentId))
      .orderBy(desc(studentEducationHistory.startDate)),

      // User interests with categories
      db.select({
        id: userInterests.id,
        interestId: userInterests.interestId,
        proficiencyLevel: userInterests.proficiencyLevel,
        interestName: interests.name,
        interestDescription: interests.description,
        categoryId: interests.categoryId,
        categoryName: interestCategories.name
      })
      .from(userInterests)
      .leftJoin(interests, eq(userInterests.interestId, interests.id))
      .leftJoin(interestCategories, eq(interests.categoryId, interestCategories.id))
      .where(eq(userInterests.userId, studentId)),

      // User skills with categories
      db.select({
        id: userSkills.id,
        skillId: userSkills.skillId,
        proficiencyLevel: userSkills.proficiencyLevel,
        skillName: skills.name,
        skillDescription: skills.description,
        categoryId: skills.categoryId,
        categoryName: skillCategories.name
      })
      .from(userSkills)
      .leftJoin(skills, eq(userSkills.skillId, skills.id))
      .leftJoin(skillCategories, eq(skills.categoryId, skillCategories.id))
      .where(eq(userSkills.userId, studentId)),

      // Social links
      db.select()
      .from(socialLinks)
      .where(eq(socialLinks.userId, studentId)),

      // Custom badges
      db.select()
      .from(customBadges)
      .where(eq(customBadges.userId, studentId)),

      // Goals
      db.select()
      .from(goals)
      .where(eq(goals.userId, studentId)),

      // Achievements
      db.select()
      .from(achievements)
      .where(eq(achievements.userId, studentId)),

      // Mood board
      db.select()
      .from(moodBoard)
      .where(eq(moodBoard.userId, studentId))
      .orderBy(moodBoard.position),

      // Connections - get both directions  
      db.select({
        id: connections.id,
        user1Id: connections.user1Id,
        user2Id: connections.user2Id,
        connectedUserFirstName: profiles.firstName,
        connectedUserLastName: profiles.lastName,
        connectedUserProfileImage: profiles.profileImageUrl,
        connectedUserRole: profiles.role
      })
      .from(connections)
      .leftJoin(profiles, eq(profiles.id, connections.user2Id))
      .where(
        and(
          eq(connections.user1Id, studentId)
        )
      )
    ]);

    monitor.endPhase('DATA_FETCH');

    // Data Processing Phase - Optimized formatting
    monitor.startPhase('DATA_PROCESSING');

    if (!profileData[0] || !studentData[0]) {
      monitor.log('DATA_ERROR', 'DATA_PROCESSING', { error: 'Student profile not found' });
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Format the response efficiently
    const formattedProfile = {
      id: studentData[0].id,
      ageGroup: studentData[0].ageGroup,
      educationLevel: studentData[0].educationLevel,
      // Only show birth info for own profile
      birthMonth: isOwnProfile ? studentData[0].birthMonth : null,
      birthYear: isOwnProfile ? studentData[0].birthYear : null,
      personalityType: studentData[0].personalityType,
      learningStyle: studentData[0].learningStyle,
      favoriteQuote: studentData[0].favoriteQuote,
      profile: {
        firstName: profileData[0].firstName,
        lastName: profileData[0].lastName,
        bio: profileData[0].bio,
        location: profileData[0].location,
        profileImageUrl: profileData[0].profileImageUrl,
        coverImageUrl: profileData[0].coverImageUrl,
        verificationStatus: profileData[0].verificationStatus,
        role: profileData[0].role,
        userInterests: interestsData.map(interest => ({
          id: interest.id,
          interestId: interest.interestId,
          proficiencyLevel: interest.proficiencyLevel,
          interest: {
            id: interest.interestId,
            name: interest.interestName,
            description: interest.interestDescription,
            categoryId: interest.categoryId,
            category: {
              name: interest.categoryName
            }
          }
        })),
        userSkills: skillsData.map(skill => ({
          id: skill.id,
          skillId: skill.skillId,
          proficiencyLevel: skill.proficiencyLevel,
          skill: {
            id: skill.skillId,
            name: skill.skillName,
            description: skill.skillDescription,
            categoryId: skill.categoryId,
            categoryName: skill.categoryName,
            category: {
              name: skill.categoryName
            }
          }
        })),
        socialLinks: socialLinksData || [],
        goals: goalsData || [],
        customBadges: customBadgesData || [],
        moodBoard: moodBoardData || []
      },
      educationHistory: educationData.map(edu => ({
        id: edu.id,
        institutionName: edu.institutionName,
        institutionTypeId: edu.institutionTypeId,
        institutionTypeName: edu.institutionTypeName,
        institutionCategoryName: edu.institutionCategoryName,
        degreeProgram: edu.degreeProgram,
        fieldOfStudy: edu.fieldOfStudy,
        subjects: edu.subjects,
        startDate: edu.startDate,
        endDate: edu.endDate,
        isCurrent: edu.isCurrent,
        gradeLevel: edu.gradeLevel,
        gpa: edu.gpa,
        achievements: edu.achievements,
        description: edu.description,
        institutionVerified: edu.institutionVerified
      }))
    };

    monitor.endPhase('DATA_PROCESSING');

    const report = await monitor.generateReport();
    console.log('📊 Student Profile API Performance Report:', {
      totalDuration: report.metadata.totalDuration,
      phases: report.phaseAnalysis.map(p => ({ 
        phase: p.phase, 
        duration: p.duration 
      })),
      bottlenecks: report.bottlenecks.length,
      recommendations: report.recommendations
    });

    monitor.log('API_SUCCESS', 'RESPONSE', {
      studentId,
      isOwnProfile,
      totalDuration: report.metadata.totalDuration,
      interestsCount: interestsData.length,
      skillsCount: skillsData.length,
      educationHistoryCount: educationData.length,
      connectionsCount: connectionsData.length
    });

    return NextResponse.json(formattedProfile)

  } catch (error) {
    const report = await monitor.generateReport();
    console.error('❌ Student Profile API Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      totalDuration: report.metadata.totalDuration,
      phase: 'ERROR_HANDLING'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
