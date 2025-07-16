import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    // Get parent name
    const parentProfile = await prisma.parentProfile.findUnique({
      where: { id: parentId },
      select: { name: true }
    })

    // Fetch complete child profile data using service role key
    const childProfile = await prisma.studentProfile.findUnique({
      where: { id: childId },
      include: {
        profile: {
          include: {
            userInterests: {
              include: {
                interest: {
                  include: {
                    category: true
                  }
                }
              }
            },
            userSkills: {
              include: {
                skill: {
                  include: {
                    category: true
                  }
                }
              }
            },
            socialLinks: true,
            goals: {
              orderBy: {
                createdAt: 'desc'
              }
            },
            achievements: {
              include: {
                achievementType: {
                  include: {
                    category: true
                  }
                }
              },
              orderBy: {
                dateOfAchievement: 'desc'
              }
            }
          }
        },
        educationHistory: {
          include: {
            institutionType: {
              include: {
                category: true
              }
            }
          },
          orderBy: {
            startDate: 'desc'
          }
        }
      }
    })

    if (!childProfile) {
      return NextResponse.json(
        { success: false, error: 'Child profile not found' },
        { status: 404 }
      )
    }

    // Get child's connections
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: childId },
          { user2Id: childId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      }
    })

    // Format connections to show the other user
    const formattedConnections = connections.map(connection => {
      const otherUser = connection.user1Id === childId ? connection.user2 : connection.user1
      return {
        id: connection.id,
        user: otherUser
      }
    })

    // Note: Achievements will be handled through custom badges which are already included above

    const formattedProfile = {
      id: childProfile.id,
      ageGroup: childProfile.age_group,
      educationLevel: childProfile.educationLevel,
      birthMonth: childProfile.birthMonth,
      birthYear: childProfile.birthYear,
      personalityType: childProfile.personalityType,
      learningStyle: childProfile.learningStyle,
      favoriteQuote: childProfile.favoriteQuote,
      profile: {
        firstName: childProfile.profile.firstName,
        lastName: childProfile.profile.lastName,
        bio: childProfile.profile.bio,
        location: childProfile.profile.location,
        profileImageUrl: childProfile.profile.profileImageUrl,
        coverImageUrl: childProfile.profile.coverImageUrl,
        tagline: childProfile.profile.tagline,
        verificationStatus: childProfile.profile.verificationStatus,
        role: childProfile.profile.role,
        userInterests: childProfile.profile.userInterests,
        userSkills: childProfile.profile.userSkills,
        socialLinks: childProfile.profile.socialLinks,
        goals: childProfile.profile.goals,
        userAchievements: childProfile.profile.achievements
      },
      educationHistory: childProfile.educationHistory.map(edu => {
          // Debug log for parent API
          console.log('🔍 Parent API Education verification status:', {
            institution: edu.institutionName,
            institutionVerified: edu.institutionVerified,
            type: typeof edu.institutionVerified
          });

          return {
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
          };
        }),
      connections: formattedConnections
    }

    return NextResponse.json({
      success: true,
      child: formattedProfile,
      parentName: parentProfile?.name || "Parent"
    })

  } catch (error) {
    console.error('Error fetching child profile:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}