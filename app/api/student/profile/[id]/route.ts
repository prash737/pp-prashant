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
    const studentId = resolvedParams.id

    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the current user has permission to view student profiles
    const currentUserProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!currentUserProfile || !['student', 'institution', 'mentor'].includes(currentUserProfile.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if the target profile exists and is a student
    const targetProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      select: { role: true }
    })

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (targetProfile.role !== 'student') {
      return NextResponse.json(
        { error: 'Profile is not a student profile' },
        { status: 403 }
      )
    }

    // Fetch comprehensive student data with all relationships
    const studentData = await prisma.profile.findUnique({
      where: {
        id: resolvedParams.id,
        role: 'student'
      },
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
        achievements: {
          include: {
            achievementType: true
          },
          orderBy: {
            dateOfAchievement: 'desc'
          }
        },
        goals: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        userCollections: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        student: {
          include: {
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
            },
            circles: {
              include: {
                creator: {
                  select: {
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true
                  }
                },
                _count: {
                  select: {
                    members: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        },
        socialLinks: true,
        // Fetch connections data
        sentConnections: {
          where: {
            status: 'accepted'
          },
          include: {
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true
              }
            }
          }
        },
        receivedConnections: {
          where: {
            status: 'accepted'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true
              }
            }
          }
        },
        // Fetch following institutions
        institutionFollowConnections: {
          include: {
            institution: {
              select: {
                id: true,
                institutionName: true,
                profileImageUrl: true,
                verificationStatus: true
              }
            }
          }
        }
      }
    })

    if (!studentData) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Fetch suggested connections separately (algorithm-based)
    const suggestedConnections = await prisma.profile.findMany({
      where: {
        AND: [
          { role: { in: ['student', 'mentor'] } },
          { id: { not: resolvedParams.id } },
          {
            OR: [
              {
                userInterests: {
                  some: {
                    interest: {
                      id: {
                        in: studentData?.userInterests?.map(ui => ui.interest.id) || []
                      }
                    }
                  }
                }
              },
              {
                userSkills: {
                  some: {
                    skill: {
                      id: {
                        in: studentData?.userSkills?.map(us => us.skill.id) || []
                      }
                    }
                  }
                }
              }
            ]
          },
          // Exclude existing connections
          {
            NOT: {
              OR: [
                {
                  sentConnections: {
                    some: {
                      receiverId: resolvedParams.id
                    }
                  }
                },
                {
                  receivedConnections: {
                    some: {
                      senderId: resolvedParams.id
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        role: true,
        bio: true,
        userInterests: {
          include: {
            interest: true
          },
          take: 3
        }
      },
      take: 6
    })

    // Process connections data
    const allConnections = [
      ...(studentData?.sentConnections?.map(conn => conn.receiver) || []),
      ...(studentData?.receivedConnections?.map(conn => conn.sender) || [])
    ]

    const connectionCounts = {
      total: allConnections.length,
      students: allConnections.filter(conn => conn.role === 'student').length,
      mentors: allConnections.filter(conn => conn.role === 'mentor').length,
      institutions: allConnections.filter(conn => conn.role === 'institution').length
    }

    // Transform and return comprehensive data
    const response = {
      id: studentData.id,
      ageGroup: studentData.student?.ageGroup,
      educationLevel: studentData.student?.educationLevel,
      birthMonth: studentData.student?.birthMonth,
      birthYear: studentData.student?.birthYear,
      personalityType: studentData.student?.personalityType,
      learningStyle: studentData.student?.learningStyle,
      favoriteQuote: studentData.student?.favoriteQuote,
      profile: {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        bio: studentData.bio,
        location: studentData.location,
        profileImageUrl: studentData.profileImageUrl,
        coverImageUrl: studentData.coverImageUrl,
        verificationStatus: studentData.verificationStatus,
        tagline: studentData.tagline,
        userInterests: studentData.userInterests,
        userSkills: studentData.userSkills.map(userSkill => ({
          ...userSkill,
          skill: {
            ...userSkill.skill,
            categoryId: userSkill.skill.categoryId,
            categoryName: userSkill.skill.category?.name || 'Uncategorized'
          }
        })),
        socialLinks: studentData.socialLinks
      },
      educationHistory: studentData.student?.educationHistory.map(edu => ({
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
      })) || [],
      achievements: studentData.achievements || [],
      goals: studentData.goals || [],
      circles: studentData.student?.circles || [],
      userCollections: studentData.userCollections || [],
      connections: allConnections,
      connectionCounts: connectionCounts,
      followingInstitutions: studentData.institutionFollowConnections?.map(conn => conn.institution) || [],
      suggestedConnections: suggestedConnections
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}