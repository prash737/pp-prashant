
import { NextRequest, NextResponse } from 'next/server'
import { getUserProfile, updateUserProfile, updateStudentProfile } from '@/lib/db/profile'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Extract user ID from query params or URL since no auth check
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Optimized single query to get all profile data - fastest possible query
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        tagline: true,
        professionalSummary: true,
        profileImageUrl: true,
        coverImageUrl: true,
        timezone: true,
        availabilityStatus: true,
        role: true,
        student: {
          select: {
            educationLevel: true,
            age_group: true,
            birthMonth: true,
            birthYear: true,
            personalityType: true,
            learningStyle: true,
            favoriteQuote: true
          }
        },
        mentor: true,
        institution: true,
        userInterests: {
          select: {
            interest: {
              select: {
                id: true,
                name: true,
                category: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        userSkills: {
          select: {
            proficiencyLevel: true,
            skill: {
              select: {
                id: true,
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
    const body = await request.json()
    const userId = body.userId || body.id

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Validate required fields
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

    // Update main profile using Prisma - optimized update
    const updatedProfile = await updateUserProfile(userId, {
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

      // Get existing student profile to access birth data - optimized query
      const existingStudentProfile = await prisma.studentProfile.findUnique({
        where: { id: userId },
        select: { birthMonth: true, birthYear: true }
      });

      const calculatedAgeGroup = existingStudentProfile 
        ? calculateAgeGroup(existingStudentProfile.birthMonth || "", existingStudentProfile.birthYear || "")
        : "young_adult";

      await updateStudentProfile(userId, {
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
