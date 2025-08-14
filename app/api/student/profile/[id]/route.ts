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
  const apiStartTime = performance.now();
  console.log('🚀 [API] Student Profile API Request Started', { timestamp: apiStartTime });

  try {
    const paramsStartTime = performance.now();
    const resolvedParams = await params;
    const paramsEndTime = performance.now();
    console.log('📋 [API] Params Resolution Complete', { 
      duration: paramsEndTime - paramsStartTime,
      studentId: resolvedParams.id 
    });

    const studentId = resolvedParams.id

    // Get user from session cookie to verify authentication
    const authStartTime = performance.now();
    console.log('🔐 [API] Authentication Started');

    const cookieParseStartTime = performance.now();
    const cookieStore = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    );
    const cookieParseEndTime = performance.now();
    console.log('🍪 [API] Cookie Parsing Complete', { 
      duration: cookieParseEndTime - cookieParseStartTime,
      hasCookies: Object.keys(cookies).length > 0
    });

    const accessToken = cookies['sb-access-token'];
    if (!accessToken) {
      console.log('❌ [API] No Access Token Found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const supabaseAuthStartTime = performance.now();
    console.log('🔍 [API] Supabase Auth Verification Started');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    const supabaseAuthEndTime = performance.now();
    
    console.log('🔍 [API] Supabase Auth Verification Complete', {
      duration: supabaseAuthEndTime - supabaseAuthStartTime,
      hasUser: !!user,
      hasError: !!authError
    });

    if (authError || !user) {
      console.log('❌ [API] Authentication Failed', { authError });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authEndTime = performance.now();
    console.log('✅ [API] Authentication Complete', { 
      totalAuthDuration: authEndTime - authStartTime,
      userId: user.id
    });

    // Check if the current user has permission to view student profiles
    const permissionCheckStartTime = performance.now();
    console.log('🛡️ [API] Permission Check Started');

    const currentUserQueryStartTime = performance.now();
    const currentUserProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    });
    const currentUserQueryEndTime = performance.now();
    console.log('👤 [API] Current User Profile Query Complete', {
      duration: currentUserQueryEndTime - currentUserQueryStartTime,
      role: currentUserProfile?.role
    });

    if (!currentUserProfile || !['student', 'institution', 'mentor'].includes(currentUserProfile.role)) {
      console.log('❌ [API] Access Denied - Invalid Role', { 
        role: currentUserProfile?.role,
        hasProfile: !!currentUserProfile
      });
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if the target profile exists and is a student
    const targetProfileQueryStartTime = performance.now();
    const targetProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      select: { role: true }
    });
    const targetProfileQueryEndTime = performance.now();
    console.log('🎯 [API] Target Profile Query Complete', {
      duration: targetProfileQueryEndTime - targetProfileQueryStartTime,
      exists: !!targetProfile,
      role: targetProfile?.role
    });

    if (!targetProfile) {
      console.log('❌ [API] Target Profile Not Found');
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (targetProfile.role !== 'student') {
      console.log('❌ [API] Target Profile Not Student', { role: targetProfile.role });
      return NextResponse.json(
        { error: 'Profile is not a student profile' },
        { status: 403 }
      )
    }

    const permissionCheckEndTime = performance.now();
    console.log('✅ [API] Permission Checks Complete', {
      totalDuration: permissionCheckEndTime - permissionCheckStartTime
    });

    const mainQueryStartTime = performance.now();
    console.log('📊 [API] Main Student Profile Query Started', { studentId });

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
    });
    
    const mainQueryEndTime = performance.now();
    console.log('📊 [API] Main Student Profile Query Complete', {
      duration: mainQueryEndTime - mainQueryStartTime,
      hasProfile: !!studentProfile,
      interestsCount: studentProfile?.profile?.userInterests?.length || 0,
      skillsCount: studentProfile?.profile?.userSkills?.length || 0,
      educationHistoryCount: studentProfile?.educationHistory?.length || 0,
      connectionsCount: ((studentProfile?.profile?.connections1?.length || 0) + (studentProfile?.profile?.connections2?.length || 0))
    });

    if (!studentProfile) {
      console.log('❌ [API] Student Profile Not Found in Database');
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Format the response - for viewing other profiles, we might want to limit some sensitive data
    const dataFormattingStartTime = performance.now();
    console.log('🔄 [API] Data Formatting Started');

    const isOwnProfile = studentId === user.id;

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

    const dataFormattingEndTime = performance.now();
    console.log('🔄 [API] Data Formatting Complete', {
      duration: dataFormattingEndTime - dataFormattingStartTime,
      responseDataKeys: Object.keys(formattedProfile)
    });

    const apiEndTime = performance.now();
    const totalDuration = apiEndTime - apiStartTime;
    
    console.log('🏁 [API] Student Profile API Request Complete', {
      totalDuration,
      studentId,
      isOwnProfile,
      breakdown: {
        authentication: 'logged separately',
        permissionChecks: 'logged separately', 
        mainQuery: 'logged separately',
        dataFormatting: dataFormattingEndTime - dataFormattingStartTime
      }
    });

    return NextResponse.json(formattedProfile)

  } catch (error) {
    const apiEndTime = performance.now();
    const totalDuration = apiEndTime - apiStartTime;
    
    console.error('❌ [API] Error fetching student profile:', error);
    console.log('🏁 [API] API Request Failed', {
      totalDuration,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}