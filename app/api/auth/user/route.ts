import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('API: User data request received')

    // Check for authentication token in cookies
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const userId = cookieStore.get('sb-user-id')?.value

    console.log('API: Checking cookies for auth token...')
    console.log('API: Access token exists:', !!accessToken)
    console.log('API: User ID exists:', !!userId)

    if (!accessToken || !userId) {
      console.log('API: No authentication token found')
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    console.log('API: Fetching user profile from database...')

    // Import Drizzle dependencies
    const { db } = await import('@/lib/db/drizzle')
    const { profiles, studentProfiles, mentorProfiles, institutionProfiles, userInterests, studentEducationHistory } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')

    // Get user's complete profile with all related data using Drizzle
    const profileResult = await db
      .select({
        profile: profiles,
        student: studentProfiles,
        mentor: mentorProfiles,
        institution: institutionProfiles
      })
      .from(profiles)
      .leftJoin(studentProfiles, eq(studentProfiles.id, profiles.id))
      .leftJoin(mentorProfiles, eq(mentorProfiles.id, profiles.id))
      .leftJoin(institutionProfiles, eq(institutionProfiles.id, profiles.id))
      .where(eq(profiles.id, userId))

    if (!profileResult.length || !profileResult[0].profile) {
      console.log('API: No profile found for user ID:', userId)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    const profile = profileResult[0].profile
    const studentProfile = profileResult[0].student
    const mentorProfile = profileResult[0].mentor
    const institutionProfile = profileResult[0].institution

    console.log('API: Profile found for role:', profile.role)

    // For students, determine onboarding completion by checking data presence
    let onboardingCompleted = false
    if (profile.role === 'student') {
      try {
        // Check parent verification and email verification for students under 16
        if (studentProfile && studentProfile.birthYear && studentProfile.birthMonth) {
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth() + 1

          const birthYear = parseInt(studentProfile.birthYear)
          const birthMonth = parseInt(studentProfile.birthMonth)

          let ageInYears = currentYear - birthYear
          if (currentMonth < birthMonth) {
            ageInYears--
          }

          // Check if student is under 16 and verification status
          if (ageInYears < 16) {
            const isParentVerified = profile.parentVerified || false
            const isEmailVerified = profile.emailVerified || false

            // Check verification status and return appropriate response
            if (!isParentVerified || !isEmailVerified) {
              return NextResponse.json({
                success: true,
                user: {
                  id: profile.id,
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  email: profile.email,
                  role: profile.role,
                },
                needsParentApproval: !isParentVerified,
                needsEmailVerification: !isEmailVerified,
                onboardingCompleted: false
              })
            }
          }
        }

        // Check if user has minimum required data for all three essential sections
        const hasBasicInfo = !!(profile.firstName && profile.lastName && profile.bio)

        // Check interests using Drizzle
        const interests = await db
          .select()
          .from(userInterests)
          .where(eq(userInterests.userId, profile.id))
        const hasInterests = !!(interests.length > 0)

        // Check education using Drizzle
        const education = await db
          .select()
          .from(studentEducationHistory)
          .where(eq(studentEducationHistory.studentId, profile.id))
        const hasEducation = !!(education.length > 0)

        onboardingCompleted = hasBasicInfo && hasInterests && hasEducation

        console.log('API: Onboarding completion check:', {
          userId: profile.id,
          hasBasicInfo,
          hasInterests: `${interests.length} interests`,
          hasEducation: `${education.length} education entries`,
          onboardingCompleted
        })
      } catch (error) {
        console.error('API: Error checking onboarding completion:', error)
        onboardingCompleted = false
      }
    } else if (profile.role === 'mentor' && mentorProfile) {
      onboardingCompleted = mentorProfile.onboardingCompleted || false
    } else if (profile.role === 'institution' && institutionProfile) {
      onboardingCompleted = institutionProfile.onboardingCompleted || false
    }

    // Return user data
    const userData = {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      role: profile.role,
      profileImageUrl: profile.profileImageUrl,
      bio: profile.bio,
      onboardingCompleted,
    }

    console.log('API: Returning user data successfully')

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error('API: Error fetching user data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}