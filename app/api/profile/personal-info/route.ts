import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, updateUserProfile, updateStudentProfile } from '@/lib/db/profile'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // No authentication check - open access

    // Get the access token from cookies
    const cookieStore = await cookies()

    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - no access token' }, { status: 401 })
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    // Use optimized single query to get all profile data
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        student: true,
        mentor: true,
        institution: true,
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
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Format the response to match the expected structure
    const formattedProfile = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      location: profile.location,
      tagline: profile.tagline,
      professionalSummary: profile.professionalSummary,
      profileImageUrl: profile.profileImageUrl,
      coverImageUrl: profile.coverImageUrl,
      timezone: profile.timezone,
      availabilityStatus: profile.availabilityStatus,
      role: profile.role,
      // Student-specific fields
      ...(profile.student && {
        educationLevel: profile.student.educationLevel,
        ageGroup: profile.student.age_group,
        birthMonth: profile.student.birthMonth,
        birthYear: profile.student.birthYear,
        personalityType: profile.student.personalityType,
        learningStyle: profile.student.learningStyle,
        favoriteQuote: profile.student.favoriteQuote
      }),
      // Include interests and skills
      interests: profile.userInterests?.map(ui => ({
        id: ui.interest.id,
        name: ui.interest.name,
        category: ui.interest.category.name
      })) || [],
      skills: profile.userSkills?.map(us => ({
        id: us.skill.id,
        name: us.skill.name,
        category: us.skill.category.name,
        level: us.proficiencyLevel
      })) || []
    }

    const response = NextResponse.json(formattedProfile)

    // Add cache headers to reduce unnecessary requests
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')

    return response
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    // Get the access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized - no access token' }, { status: 401 })
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields (use authenticated user ID)
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Separate profile data from student-specific data
    const {
      educationLevel,
      ageGroup,
      birthMonth,
      birthYear,
      personalityType,
      learningStyle,
      favoriteQuote,
      linkedinUrl,
      portfolioUrl,
      ...profileData
    } = body

    // Update main profile using Prisma
    const updatedProfile = await updateUserProfile(user.id, {
      firstName: profileData.firstName.trim(),
      lastName: profileData.lastName.trim(),
      bio: profileData.bio?.trim() || null,
      location: profileData.location?.trim() || null,
      tagline: profileData.tagline,
      professionalSummary: profileData.professionalSummary,
      profileImageUrl: profileData.profileImageUrl,
      coverImageUrl: profileData.coverImageUrl,
      timezone: profileData.timezone,
      availabilityStatus: profileData.availabilityStatus,
    })

    // Update student profile if student-specific data is provided
    if (updatedProfile.role === 'student' && 
        (educationLevel || ageGroup || birthMonth || birthYear || personalityType || learningStyle || favoriteQuote)) {

      // Calculate age group from birth data if available
      const calculateAgeGroup = (birthMonth: string, birthYear: string): string => {
        if (!birthMonth || !birthYear) return "young_adult";

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const birthYearNum = parseInt(birthYear);
        const birthMonthNum = parseInt(birthMonth);

        let ageInYears = currentYear - birthYearNum;
        if (currentMonth < birthMonthNum) {
          ageInYears--;
        }

        if (ageInYears < 5) {
          return "early_childhood";
        } else if (ageInYears < 11) {
          return "elementary";
        } else if (ageInYears < 13) {
          return "middle_school";
        } else if (ageInYears < 18) {
          return "high_school";
        } else {
          return "young_adult";
        }
      };

      // Get existing student profile to access birth data
      const existingStudentProfile = await prisma.studentProfile.findUnique({
        where: { id: user.id },
        select: { birthMonth: true, birthYear: true }
      });

      const calculatedAgeGroup = existingStudentProfile 
        ? calculateAgeGroup(existingStudentProfile.birthMonth || "", existingStudentProfile.birthYear || "")
        : "young_adult";

      await updateStudentProfile(user.id, {
        educationLevel,
        age_group: calculatedAgeGroup, // Note: using age_group as per database schema
        birthMonth,
        birthYear,
        personalityType,
        learningStyle,
        favoriteQuote
      })
    }

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}