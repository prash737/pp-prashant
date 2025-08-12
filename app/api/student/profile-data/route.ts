
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-cache'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('⏱️ [STUDENT-PROFILE-DATA] Starting unified data fetch...')

  try {
    // Use cached authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ [STUDENT-PROFILE-DATA] Auth completed in', Date.now() - startTime, 'ms')

    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    const dataFetchStart = Date.now()
    console.log('⏱️ [STUDENT-PROFILE-DATA] Fetching student data...')

    // Single comprehensive query with all necessary data
    const studentProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      include: {
        // Student-specific data
        student: true,
        // Interests with categories
        userInterests: {
          include: {
            interest: {
              include: {
                category: {
                  select: { name: true }
                }
              }
            }
          }
        },
        // Skills with categories  
        userSkills: {
          include: {
            skill: {
              include: {
                category: {
                  select: { name: true }
                }
              }
            }
          }
        },
        // Social links
        socialLinks: true,
        // Achievements
        achievements: true,
        // Goals
        goals: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // Get parent profile separately if parent exists
    let parentProfile = null
    if (studentProfile?.parentId) {
      parentProfile = await prisma.parentProfile.findUnique({
        where: { id: studentProfile.parentId },
        select: {
          id: true,
          email: true,
          isVerified: true,
          parentVerified: true
        }
      })
    }

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    // Fetch education history separately (different table structure)
    const educationHistory = await prisma.studentEducationHistory.findMany({
      where: { studentId },
      include: {
        institutionType: {
          include: {
            category: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    console.log('✅ [STUDENT-PROFILE-DATA] Data fetch completed in', Date.now() - dataFetchStart, 'ms')

    // Format response data
    const formattedProfile = {
      id: studentProfile.id,
      firstName: studentProfile.firstName,
      lastName: studentProfile.lastName,
      profileImageUrl: studentProfile.profileImageUrl,
      bio: studentProfile.bio,
      location: studentProfile.location,
      role: studentProfile.role,
      socialLinks: studentProfile.socialLinks,
      
      // Student-specific data
      student: studentProfile.student ? {
        age_group: studentProfile.student.ageGroup,
        birthYear: studentProfile.student.birthYear,
        birthMonth: studentProfile.student.birthMonth,
        gradeLevel: studentProfile.student.gradeLevel,
        gpa: studentProfile.student.gpa,
        parentProfile: parentProfile
      } : null,

      // Formatted interests
      interests: studentProfile.userInterests.map(ui => ({
        id: ui.interest.id,
        name: ui.interest.name,
        category: ui.interest.category?.name || 'Uncategorized'
      })),

      // Formatted skills
      skills: studentProfile.userSkills.map(us => ({
        id: us.skill.id,
        name: us.skill.name,
        category: us.skill.category?.name || 'Uncategorized'
      })),

      // Education history
      educationHistory: educationHistory.map(edu => ({
        id: edu.id,
        institutionName: edu.institutionName,
        institutionTypeId: edu.institutionTypeId,
        institutionTypeName: edu.institutionType?.name,
        institutionCategoryName: edu.institutionType?.category?.name,
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
      })),

      // Achievements
      achievements: studentProfile.achievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.achievementType?.name || 'General',
        dateOfAchievement: achievement.dateOfAchievement,
        iconUrl: achievement.achievementImageIcon
      })),

      // Goals
      goals: studentProfile.goals
    }

    console.log('✅ [STUDENT-PROFILE-DATA] Total request completed in', Date.now() - startTime, 'ms')

    return NextResponse.json(formattedProfile, {
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minute cache
      }
    })

  } catch (error) {
    console.error('❌ [STUDENT-PROFILE-DATA] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
