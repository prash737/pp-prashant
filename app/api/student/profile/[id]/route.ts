
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedAuthUser } from '@/lib/services/auth-cache-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id

    // Use cached auth
    const { user, error: authError } = await getCachedAuthUser(request)
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

    const isOwnProfile = studentId === user.id

    // Single comprehensive query to get ALL profile data
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: studentId },
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
            customBadges: true,
            goals: true,
            achievements: true,
            moodBoard: {
              orderBy: {
                position: 'asc'
              }
            },
            // Connections data
            connections1: {
              where: {
                status: 'accepted'
              },
              include: {
                user2: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                    role: true,
                    bio: true,
                    location: true
                  }
                }
              },
              orderBy: {
                connectedAt: 'desc'
              }
            },
            connections2: {
              where: {
                status: 'accepted'
              },
              include: {
                user1: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                    role: true,
                    bio: true,
                    location: true
                  }
                }
              },
              orderBy: {
                connectedAt: 'desc'
              }
            },
            // Following institutions
            institutionFollowConnections: {
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
              },
              orderBy: {
                connectedAt: 'desc'
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

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Get connection requests (only for own profile)
    let connectionRequests = []
    if (isOwnProfile) {
      const [receivedRequests, sentRequests] = await Promise.all([
        prisma.connectionRequest.findMany({
          where: {
            receiverId: studentId,
            status: 'pending'
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
                bio: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.connectionRequest.findMany({
          where: {
            senderId: studentId
          },
          include: {
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
                bio: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      ])

      connectionRequests = {
        received: receivedRequests,
        sent: sentRequests
      }
    }

    // Get circles data
    const circles = await prisma.circleBadge.findMany({
      where: {
        OR: [
          { creatorId: studentId },
          {
            memberships: {
              some: {
                userId: studentId,
                status: 'active'
              }
            }
          }
        ]
      },
      include: {
        _count: {
          select: {
            memberships: {
              where: {
                status: 'active'
              }
            }
          }
        },
        memberships: {
          where: {
            status: 'active'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
                bio: true
              }
            }
          },
          take: 5 // Limit to first 5 members for preview
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    // Get circle invitations (only for own profile)
    let circleInvitations = []
    if (isOwnProfile) {
      circleInvitations = await prisma.circleInvitation.findMany({
        where: {
          inviteeId: studentId,
          status: 'pending'
        },
        include: {
          circle: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          },
          inviter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              role: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    // Get suggested connections (only for own profile)
    let suggestedConnections = []
    if (isOwnProfile) {
      // Get users with similar interests/skills
      const userInterestIds = studentProfile.profile.userInterests.map(ui => ui.interestId)
      const userSkillIds = studentProfile.profile.userSkills.map(us => us.skillId)

      suggestedConnections = await prisma.profile.findMany({
        where: {
          AND: [
            { id: { not: studentId } },
            { role: { in: ['student', 'mentor'] } },
            {
              OR: [
                {
                  userInterests: {
                    some: {
                      interestId: { in: userInterestIds }
                    }
                  }
                },
                {
                  userSkills: {
                    some: {
                      skillId: { in: userSkillIds }
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
                    connections1: {
                      some: {
                        user2Id: studentId,
                        status: 'accepted'
                      }
                    }
                  },
                  {
                    connections2: {
                      some: {
                        user1Id: studentId,
                        status: 'accepted'
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
          location: true
        },
        take: 10
      })
    }

    // Format connections
    const connections = [
      ...studentProfile.profile.connections1.map(conn => ({
        id: conn.id,
        connectedAt: conn.connectedAt,
        connectionType: conn.connectionType,
        user: conn.user2
      })),
      ...studentProfile.profile.connections2.map(conn => ({
        id: conn.id,
        connectedAt: conn.connectedAt,
        connectionType: conn.connectionType,
        user: conn.user1
      }))
    ].sort((a, b) => new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime())

    // Count connections by role
    const connectionCounts = connections.reduce((acc, conn) => {
      acc[conn.user.role] = (acc[conn.user.role] || 0) + 1
      acc.total = (acc.total || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Format the comprehensive response
    const formattedProfile = {
      id: studentProfile.id,
      ageGroup: studentProfile.age_group,
      educationLevel: studentProfile.educationLevel,
      birthMonth: isOwnProfile ? studentProfile.birthMonth : null,
      birthYear: isOwnProfile ? studentProfile.birthYear : null,
      personalityType: studentProfile.personalityType,
      learningStyle: studentProfile.learningStyle,
      favoriteQuote: studentProfile.favoriteQuote,
      profile: {
        firstName: studentProfile.profile.firstName,
        lastName: studentProfile.profile.lastName,
        bio: studentProfile.profile.bio,
        location: studentProfile.profile.location,
        profileImageUrl: studentProfile.profile.profileImageUrl,
        coverImageUrl: studentProfile.profile.coverImageUrl,
        verificationStatus: studentProfile.profile.verificationStatus,
        role: studentProfile.profile.role,
        userInterests: studentProfile.profile.userInterests,
        userSkills: studentProfile.profile.userSkills.map(userSkill => ({
          ...userSkill,
          skill: {
            ...userSkill.skill,
            categoryId: userSkill.skill.categoryId,
            categoryName: userSkill.skill.category?.name || 'Uncategorized'
          }
        })),
        socialLinks: studentProfile.profile.socialLinks || [],
        goals: studentProfile.profile.goals,
        customBadges: studentProfile.profile.customBadges,
        achievements: studentProfile.profile.achievements,
        moodBoard: studentProfile.profile.moodBoard
      },
      educationHistory: studentProfile.educationHistory.map(edu => ({
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
      // Consolidated connection data
      connections: {
        list: connections,
        counts: connectionCounts,
        total: connectionCounts.total || 0
      },
      // Following institutions
      followingInstitutions: {
        list: studentProfile.profile.institutionFollowConnections.map(conn => ({
          id: conn.id,
          connectedAt: conn.connectedAt,
          institution: conn.receiver
        })),
        count: studentProfile.profile.institutionFollowConnections.length
      },
      // Circles data
      circles: {
        list: circles.map(circle => ({
          id: circle.id,
          name: circle.name,
          description: circle.description,
          color: circle.color,
          icon: circle.icon,
          isDefault: circle.isDefault,
          isCreator: circle.creatorId === studentId,
          memberCount: circle._count.memberships,
          members: circle.memberships.map(m => m.user)
        })),
        count: circles.length
      },
      // Only include these for own profile
      ...(isOwnProfile && {
        connectionRequests,
        circleInvitations,
        suggestedConnections
      })
    }

    // Add cache headers
    const response = NextResponse.json(formattedProfile)
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')

    return response

  } catch (error) {
    console.error('Error fetching comprehensive student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
