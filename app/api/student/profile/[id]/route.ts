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
            connections1: {
              include: {
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
            },
            connections2: {
              include: {
                user1: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profileImageUrl: true,
                    role: true
                  }
                }
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

    // Format the response - for viewing other profiles, we might want to limit some sensitive data
    const isOwnProfile = studentId === user.id

    const formattedProfile = {
      id: studentProfile.id,
      ageGroup: studentProfile.age_group,
      educationLevel: studentProfile.educationLevel,
      // Only show birth info for own profile
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
        // Social links are public, but sensitive contact info is private
        socialLinks: studentProfile.profile.socialLinks || [],
        goals: studentProfile.profile.goals,
        customBadges: studentProfile.profile.customBadges,
        moodBoard: studentProfile.profile.moodBoard
      },
      educationHistory: studentProfile.educationHistory.map(edu => {
        // Debug log for complete raw database record
        console.log('🔍 RAW DB Education record:', JSON.stringify({
          id: edu.id,
          institutionName: edu.institutionName,
          institutionVerified: edu.institutionVerified,
          fullRecord: edu
        }, null, 2));

        console.log('🔍 API Education verification status:', {
          institution: edu.institutionName,
          institutionVerified: edu.institutionVerified,
          type: typeof edu.institutionVerified,
          hasProperty: Object.prototype.hasOwnProperty.call(edu, 'institutionVerified'),
          allKeys: Object.keys(edu)
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
      })
    }

    return NextResponse.json(formattedProfile)

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}