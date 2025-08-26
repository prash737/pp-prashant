import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { profiles, studentProfiles, studentEducationHistory, userInterests, interests, userSkills, skills, userAchievements, achievements, userGoals, goals, circleMemberships, circleBadges } from '@/lib/drizzle/schema'
import { eq, and, desc, asc, isNull, or, inArray, sql } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to execute Drizzle queries with retry logic (assuming it's defined elsewhere)
// For demonstration purposes, let's define a placeholder here.
// In a real application, this would likely be imported or defined globally.
const executeWithRetry = async (queryFn: () => Promise<any>) => {
  try {
    return await queryFn()
  } catch (error) {
    console.error('Query execution failed:', error)
    throw error // Re-throw the error if retry logic is not implemented here
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id

    // ⏱️ Start Total API Timer
    const totalStartTime = Date.now()
    console.log(`🚀 Starting student profile API for ID: ${studentId}`)

    // ⏱️ Phase 1: Authentication & Validation
    const authStartTime = Date.now()
    console.log('🔐 Phase 1: Starting authentication & validation')

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

    const authEndTime = Date.now()
    const authDuration = authEndTime - authStartTime
    console.log(`✅ Phase 1 Complete: Authentication & validation took ${authDuration}ms`)

    // ⏱️ Phase 2: Main Student Data Fetch
    const mainDataStartTime = Date.now()
    console.log('📊 Phase 2: Starting main student data fetch (comprehensive Prisma query)')

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
            }
          }
        },
        circleMemberships: {
          include: {
            circle: {
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
                    memberships: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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
        institutionFollowing: {
          include: {
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                verificationStatus: true,
                institution: {
                  select: {
                    institutionName: true,
                    institutionType: true,
                    institutionTypeId: true,
                    website: true,
                    logoUrl: true,
                    verified: true,
                    institutionTypeRef: {
                      select: {
                        name: true,
                        category: {
                          select: {
                            name: true
                          }
                        }
                      }
                    }
                  }
                }
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

    const mainDataEndTime = Date.now()
    const mainDataDuration = mainDataEndTime - mainDataStartTime
    console.log(`✅ Phase 2 Complete: Main student data fetch took ${mainDataDuration}ms`)

    // ⏱️ Phase 3: Suggested Connections Query
    const suggestedConnectionsStartTime = Date.now()
    console.log('🔗 Phase 3: Starting suggested connections algorithm')

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

    const suggestedConnectionsEndTime = Date.now()
    const suggestedConnectionsDuration = suggestedConnectionsEndTime - suggestedConnectionsStartTime
    console.log(`✅ Phase 3 Complete: Suggested connections query took ${suggestedConnectionsDuration}ms`)

    // ⏱️ Phase 4: Connections Processing
    const connectionsProcessingStartTime = Date.now()
    console.log('👥 Phase 4: Starting connections data processing')

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

    const connectionsProcessingEndTime = Date.now()
    const connectionsProcessingDuration = connectionsProcessingEndTime - connectionsProcessingStartTime
    console.log(`✅ Phase 4 Complete: Connections processing took ${connectionsProcessingDuration}ms`)

    // Fetch circles for the student using Drizzle
    console.log('🔍 DEBUG: Fetching circles for student:', studentId)
    let circles = []
    const circlesStartTime = Date.now()
    console.log('⏱️ Phase 5: Starting circles data fetch')
    try {
      // First, get circles where the student is a member
      const circleMembershipsData = await executeWithRetry(() => db
        .select({
          circleId: circleMemberships.circleId,
          status: circleMemberships.status,
          isDisabledMember: circleMemberships.isDisabledMember,
          joinedAt: circleMemberships.joinedAt,
          // Circle details
          circleName: circleBadges.name,
          circleDescription: circleBadges.description,
          circleColor: circleBadges.color,
          circleIcon: circleBadges.icon,
          circleIsDefault: circleBadges.isDefault,
          circleIsDisabled: circleBadges.isDisabled,
          circleIsCreatorDisabled: circleBadges.isCreatorDisabled,
          circleCreatedAt: circleBadges.createdAt,
          circleCreatorId: circleBadges.creatorId,
          // Creator details
          creatorFirstName: profiles.firstName,
          creatorLastName: profiles.lastName,
          creatorProfileImageUrl: profiles.profileImageUrl
        })
        .from(circleMemberships)
        .innerJoin(circleBadges, eq(circleMemberships.circleId, circleBadges.id))
        .leftJoin(profiles, eq(circleBadges.creatorId, profiles.id))
        .where(
          and(
            eq(circleMemberships.userId, studentId),
            eq(circleMemberships.status, 'active')
          )
        )
      )

      console.log('🔍 DEBUG: Raw circleMemberships data:', circleMembershipsData)

      // Also get circles where the student is the creator
      const createdCirclesData = await executeWithRetry(() => db
        .select({
          id: circleBadges.id,
          name: circleBadges.name,
          description: circleBadges.description,
          color: circleBadges.color,
          icon: circleBadges.icon,
          isDefault: circleBadges.isDefault,
          isDisabled: circleBadges.isDisabled,
          isCreatorDisabled: circleBadges.isCreatorDisabled,
          createdAt: circleBadges.createdAt,
          creatorId: circleBadges.creatorId,
          // Creator details (self)
          creatorFirstName: profiles.firstName,
          creatorLastName: profiles.lastName,
          creatorProfileImageUrl: profiles.profileImageUrl
        })
        .from(circleBadges)
        .leftJoin(profiles, eq(circleBadges.creatorId, profiles.id))
        .where(eq(circleBadges.creatorId, studentId))
      )

      console.log('🔍 DEBUG: Raw createdCircles data:', createdCirclesData)

      // Get all circle IDs to fetch membership counts
      const allCircleIds = [
        ...circleMembershipsData.map(m => m.circleId),
        ...createdCirclesData.map(c => c.id)
      ].filter((id, index, self) => self.indexOf(id) === index)

      console.log('🔍 DEBUG: All circle IDs:', allCircleIds)

      // Get membership counts and member details for all circles
      let membershipCounts = {}
      let circleMembers = {}
      if (allCircleIds.length > 0) {
        const membershipCountsData = await executeWithRetry(() => db
          .select({
            circleId: circleMemberships.circleId,
            count: sql<number>`count(*)`
          })
          .from(circleMemberships)
          .where(
            and(
              inArray(circleMemberships.circleId, allCircleIds),
              eq(circleMemberships.status, 'active')
            )
          )
          .groupBy(circleMemberships.circleId)
        )

        membershipCounts = membershipCountsData.reduce((acc, item) => {
          acc[item.circleId] = Number(item.count)
          return acc
        }, {} as Record<string, number>)

        // Get detailed member information for each circle
        const membershipDetails = await executeWithRetry(() => db
          .select({
            circleId: circleMemberships.circleId,
            userId: circleMemberships.userId,
            joinedAt: circleMemberships.joinedAt,
            // User details
            firstName: profiles.firstName,
            lastName: profiles.lastName,
            profileImageUrl: profiles.profileImageUrl,
            role: profiles.role,
            bio: profiles.bio
          })
          .from(circleMemberships)
          .innerJoin(profiles, eq(circleMemberships.userId, profiles.id))
          .where(
            and(
              inArray(circleMemberships.circleId, allCircleIds),
              eq(circleMemberships.status, 'active')
            )
          )
        )

        // Group members by circle
        circleMembers = membershipDetails.reduce((acc, member) => {
          if (!acc[member.circleId]) {
            acc[member.circleId] = []
          }
          acc[member.circleId].push({
            user: {
              id: member.userId,
              firstName: member.firstName,
              lastName: member.lastName,
              profileImageUrl: member.profileImageUrl,
              role: member.role,
              bio: member.bio
            },
            joinedAt: member.joinedAt,
            isCreator: false
          })
          return acc
        }, {} as Record<string, any[]>)
      }

      console.log('🔍 DEBUG: Membership counts:', membershipCounts)
      console.log('🔍 DEBUG: Circle members:', circleMembers)

      // Process member circles
      const memberCircles = circleMembershipsData.map(membership => ({
        id: membership.circleId,
        name: membership.circleName,
        description: membership.circleDescription,
        color: membership.circleColor,
        icon: membership.circleIcon,
        isDefault: membership.circleIsDefault,
        isDisabled: membership.circleIsDisabled,
        isCreatorDisabled: membership.circleIsCreatorDisabled,
        createdAt: membership.circleCreatedAt,
        creator: {
          id: membership.circleCreatorId,
          firstName: membership.creatorFirstName,
          lastName: membership.creatorLastName,
          profileImageUrl: membership.creatorProfileImageUrl
        },
        memberships: circleMembers[membership.circleId] || [],
        _count: {
          memberships: membershipCounts[membership.circleId] || 0
        }
      }))

      // Process created circles
      const processedCreatedCircles = createdCirclesData.map(circle => ({
        id: circle.id,
        name: circle.name,
        description: circle.description,
        color: circle.color,
        icon: circle.icon,
        isDefault: circle.isDefault,
        isDisabled: circle.isDisabled,
        isCreatorDisabled: circle.isCreatorDisabled,
        createdAt: circle.createdAt,
        creator: {
          id: circle.creatorId,
          firstName: circle.creatorFirstName,
          lastName: circle.creatorLastName,
          profileImageUrl: circle.creatorProfileImageUrl
        },
        memberships: circleMembers[circle.id] || [],
        _count: {
          memberships: membershipCounts[circle.id] || 0
        }
      }))

      // Combine and deduplicate circles
      const allCircles = [...processedCreatedCircles, ...memberCircles]
      circles = allCircles.filter((circle, index, self) => 
        index === self.findIndex(c => c.id === circle.id)
      )

      console.log('🔍 DEBUG: Processed circles data:', circles)
      console.log('🔍 DEBUG: Number of circles found:', circles.length)

    } catch (error) {
      console.error('🚨 ERROR: Failed to fetch circles:', error)
      circles = []
    }

    const circlesEndTime = Date.now()
    const circlesDuration = circlesEndTime - circlesStartTime
    console.log(`✅ Phase 5 Complete: Circles data fetch took ${circlesDuration}ms`)

    // ⏱️ Phase 6: Additional Data Fetch
    const additionalDataStartTime = Date.now()
    console.log('📋 Phase 6: Starting additional data fetch (achievements, requests, invitations)')

    // Fetch additional data for comprehensive profile
    let connectionRequestsSent = []
    let connectionRequestsReceived = []
    let circleInvitations = []
    let achievements = []

    try {
      // Always fetch achievements for the profile being viewed
      const userAchievements = await prisma.userAchievement.findMany({
        where: {
          userId: resolvedParams.id
        },
        include: {
          achievementType: true
        },
        orderBy: {
          dateOfAchievement: 'desc'
        }
      })

      achievements = userAchievements.map(achievement => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        dateOfAchievement: achievement.dateOfAchievement,
        createdAt: achievement.createdAt,
        achievementImageIcon: achievement.achievementImageIcon,
        achievementTypeId: achievement.achievementTypeId
      }))

      // Check for pending connection requests and circle invitations (only if viewing own profile)
      if (user.id === resolvedParams.id) {
        // Fetch sent connection requests
        const sentRequests = await prisma.connectionRequest.findMany({
          where: {
            senderId: user.id,
            status: 'pending'
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
        })

        // Fetch received connection requests
        const receivedRequests = await prisma.connectionRequest.findMany({
          where: {
            receiverId: user.id,
            status: 'pending'
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
        })

        // Fetch circle invitations
        const invitations = await prisma.circleInvitation.findMany({
          where: {
            inviteeId: user.id,
            status: 'pending'
          },
          include: {
            circle: {
              include: {
                creator: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true
                  }
                },
                _count: {
                  select: {
                    memberships: {
                      where: {
                        status: 'active'
                      }
                    }
                  }
                }
              }
            },
            inviter: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        connectionRequestsSent = sentRequests
        connectionRequestsReceived = receivedRequests
        circleInvitations = invitations
      } else {
        // For viewing other users, still check connection status between current user and target user
        const existingConnectionRequest = await prisma.connectionRequest.findFirst({
          where: {
            OR: [
              { senderId: user.id, receiverId: resolvedParams.id },
              { senderId: resolvedParams.id, receiverId: user.id }
            ]
          }
        })

        if (existingConnectionRequest) {
          if (existingConnectionRequest.senderId === user.id && existingConnectionRequest.status === 'pending') {
            connectionRequestsSent = [existingConnectionRequest]
          } else if (existingConnectionRequest.receiverId === user.id && existingConnectionRequest.status === 'pending') {
            connectionRequestsReceived = [existingConnectionRequest]
          }
        }
      }
    } catch (error) {
      console.error('Error fetching additional profile data:', error)
      // Continue with empty arrays if there's an error
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
        // Add top skills for ProfileHeader
        skills: studentData.userSkills.map(userSkill => ({
          id: userSkill.skill.id,
          name: userSkill.skill.name,
          proficiencyLevel: userSkill.proficiencyLevel || 50,
          category: userSkill.skill.category?.name || 'General'
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
      // achievements: studentData.achievements || [], // This line is now redundant as achievements are fetched separately
      goals: studentData.goals || [],
      circles: circles,
      userCollections: studentData.userCollections || [],
      connections: allConnections,
      connectionCounts: connectionCounts,
      followingInstitutions: studentData.institutionFollowing?.map(conn => ({
        id: conn.receiver.id,
        institutionName: conn.receiver.institution?.institutionName || `${conn.receiver.firstName} ${conn.receiver.lastName}`,
        institutionType: conn.receiver.institution?.institutionTypeRef?.name || conn.receiver.institution?.institutionType,
        category: conn.receiver.institution?.institutionTypeRef?.category?.name,
        profileImageUrl: conn.receiver.profileImageUrl,
        logoUrl: conn.receiver.institution?.logoUrl,
        website: conn.receiver.institution?.website,
        verified: conn.receiver.institution?.verified,
        verificationStatus: conn.receiver.verificationStatus
      })) || [],
      suggestedConnections: suggestedConnections,
      // Additional data for ProfileHeader - all consolidated here
      achievements: achievements,
      connectionRequestsSent: connectionRequestsSent,
      connectionRequestsReceived: connectionRequestsReceived,
      circleInvitations: circleInvitations
    }

    const additionalDataEndTime = Date.now()
    const additionalDataDuration = additionalDataEndTime - additionalDataStartTime
    console.log(`✅ Phase 6 Complete: Additional data fetch took ${additionalDataDuration}ms`)

    // ⏱️ Phase 7: Response Transformation
    const responseTransformStartTime = Date.now()
    console.log('📦 Phase 7: Starting response transformation')

    console.log('🔍 DEBUG: Final response circles:', JSON.stringify(response.circles, null, 2))
    console.log('🔍 DEBUG: Student ID for following check:', resolvedParams.id)
    console.log('🔍 DEBUG: Raw institutionFollowing data:', JSON.stringify(studentData.institutionFollowing, null, 2))
    console.log('🔍 DEBUG: Processed followingInstitutions:', JSON.stringify(response.followingInstitutions, null, 2))
    console.log('🔍 DEBUG: Following institutions count:', response.followingInstitutions.length)

    // Additional query to check if any institution follow connections exist at all
    const allFollowConnections = await prisma.institutionFollowConnection.findMany({
      where: {
        senderId: resolvedParams.id
      },
      take: 5
    })
    console.log('🔍 DEBUG: Direct query for follow connections:', JSON.stringify(allFollowConnections, null, 2))

    const responseTransformEndTime = Date.now()
    const responseTransformDuration = responseTransformEndTime - responseTransformStartTime
    console.log(`✅ Phase 7 Complete: Response transformation took ${responseTransformDuration}ms`)

    // ⏱️ Total API Completion
    const totalEndTime = Date.now()
    const totalDuration = totalEndTime - totalStartTime

    // 📊 Performance Summary
    const performanceReport = {
      apiCall: {
        endpoint: `/api/student/profile/${studentId}`,
        timestamp: new Date().toISOString(),
        totalDuration: totalDuration,
        status: 'success'
      },
      phases: {
        phase1_auth_validation: {
          name: 'Authentication & Validation',
          duration: authDuration,
          percentage: Math.round((authDuration / totalDuration) * 100)
        },
        phase2_main_data_fetch: {
          name: 'Main Student Data Fetch (Prisma)',
          duration: mainDataDuration,
          percentage: Math.round((mainDataDuration / totalDuration) * 100)
        },
        phase3_suggested_connections: {
          name: 'Suggested Connections Query',
          duration: suggestedConnectionsDuration,
          percentage: Math.round((suggestedConnectionsDuration / totalDuration) * 100)
        },
        phase4_connections_processing: {
          name: 'Connections Data Processing',
          duration: connectionsProcessingDuration,
          percentage: Math.round((connectionsProcessingDuration / totalDuration) * 100)
        },
        phase5_circles_data: {
          name: 'Circles Data Fetch (Drizzle)',
          duration: circlesDuration,
          percentage: Math.round((circlesDuration / totalDuration) * 100)
        },
        phase6_additional_data: {
          name: 'Additional Data Fetch',
          duration: additionalDataDuration,
          percentage: Math.round((additionalDataDuration / totalDuration) * 100)
        },
        phase7_response_transform: {
          name: 'Response Transformation',
          duration: responseTransformDuration,
          percentage: Math.round((responseTransformDuration / totalDuration) * 100)
        }
      },
      summary: {
        slowestPhase: Object.entries({
          'Auth & Validation': authDuration,
          'Main Data Fetch': mainDataDuration,
          'Suggested Connections': suggestedConnectionsDuration,
          'Connections Processing': connectionsProcessingDuration,
          'Circles Data': circlesDuration,
          'Additional Data': additionalDataDuration,
          'Response Transform': responseTransformDuration
        }).reduce((max, [name, duration]) => duration > max.duration ? { name, duration } : max, { name: '', duration: 0 }),
        
        performance_analysis: {
          excellent: totalDuration < 1000,
          good: totalDuration < 2000,
          acceptable: totalDuration < 3000,
          needs_optimization: totalDuration >= 3000
        },
        
        optimization_suggestions: totalDuration > 2000 ? [
          mainDataDuration > 1000 ? 'Consider optimizing the main Prisma query with better indexing' : null,
          circlesDuration > 500 ? 'Circles data fetch could benefit from query optimization' : null,
          suggestedConnectionsDuration > 500 ? 'Suggested connections algorithm needs optimization' : null,
          additionalDataDuration > 500 ? 'Additional data queries could be parallelized' : null
        ].filter(Boolean) : ['Performance is acceptable - no immediate optimizations needed']
      },
      metadata: {
        studentId: studentId,
        dataPoints: {
          interests: response.profile?.userInterests?.length || 0,
          skills: response.profile?.userSkills?.length || 0,
          educationHistory: response.educationHistory?.length || 0,
          achievements: response.achievements?.length || 0,
          connections: response.connectionCounts?.total || 0,
          circles: response.circles?.length || 0,
          goals: response.goals?.length || 0
        }
      }
    }

    console.log(`🏁 API COMPLETE: Total time ${totalDuration}ms`)
    console.log('📊 PERFORMANCE BREAKDOWN:')
    Object.entries(performanceReport.phases).forEach(([key, phase]) => {
      console.log(`   ${phase.name}: ${phase.duration}ms (${phase.percentage}%)`)
    })
    console.log(`🐌 Slowest Phase: ${performanceReport.summary.slowestPhase.name} (${performanceReport.summary.slowestPhase.duration}ms)`)

    // Check if client wants performance report
    const url = new URL(request.url)
    const downloadReport = url.searchParams.get('download-report') === 'true'

    if (downloadReport) {
      // Return performance report as downloadable JSON
      const reportResponse = new NextResponse(JSON.stringify(performanceReport, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="student-profile-performance-${studentId}-${Date.now()}.json"`
        }
      })
      return reportResponse
    }

    // Add performance report to response headers for debugging
    const responseWithTiming = new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Performance-Total': totalDuration.toString(),
        'X-Performance-Breakdown': JSON.stringify({
          auth: authDuration,
          mainData: mainDataDuration,
          suggestions: suggestedConnectionsDuration,
          connections: connectionsProcessingDuration,
          circles: circlesDuration,
          additional: additionalDataDuration,
          transform: responseTransformDuration
        })
      }
    })

    return responseWithTiming

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}