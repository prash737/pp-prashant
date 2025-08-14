import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema/profiles'
import { studentProfiles, studentEducationHistory } from '@/lib/db/schema/students'
import { mentorProfiles } from '@/lib/db/schema/mentors'
import { institutionProfiles } from '@/lib/db/schema/institutions'
import { userInterests } from '@/lib/db/schema/skills-interests'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔐 [API] Auth callback started')

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    console.log('🔐 [API] No code provided in callback')
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_code`)
  }

  try {
    // Exchange code for session
    const supabase = createClient()
    const authStartTime = Date.now()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    const authDuration = Date.now() - authStartTime
    console.log(`🔐 [API] Session exchange completed in ${authDuration}ms`)

    if (error) {
      console.error('🔐 [API] Error exchanging code for session:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=auth`)
    }

    if (!data.user) {
      console.log('🔐 [API] No user data returned')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_user`)
    }

    // Check for existing profile using Drizzle
    const dbStartTime = Date.now()

    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, data.user.id))
      .limit(1)

    if (!existingProfile) {
      console.log('🔐 [API] Creating new profile for social login user')

      // Extract names from user metadata
      const firstName = data.user.user_metadata?.full_name
        ? data.user.user_metadata.full_name.split(' ')[0]
        : 'New'
      const lastName = data.user.user_metadata?.full_name
        ? data.user.user_metadata.full_name.split(' ').slice(1).join(' ')
        : 'User'

      // Create profile
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: data.user.id,
          firstName,
          lastName,
          email: data.user.email || null,
          role: 'student', // Default to student for social logins
          onboardingCompleted: false,
        })
        .returning()

      // Create student profile
      await db
        .insert(studentProfiles)
        .values({
          id: newProfile.id,
          ageGroup: 'young_adult',
          educationLevel: 'undergraduate',
          onboardingCompleted: false,
        })

      const dbDuration = Date.now() - dbStartTime
      console.log(`🔐 [API] New user profile created in ${dbDuration}ms`)

      const totalDuration = Date.now() - startTime
      console.log(`🔐 [API] Callback completed in ${totalDuration}ms - redirecting to onboarding`)

      return NextResponse.redirect('https://pathpiper.com/onboarding')
    }

    // Check onboarding completion for existing users
    let onboardingCompleted = false

    if (existingProfile.role === 'student') {
      // Fast parallel queries for onboarding check
      const [interests, education] = await Promise.all([
        db.select().from(userInterests).where(eq(userInterests.userId, existingProfile.id)).limit(1),
        db.select().from(studentEducationHistory).where(eq(studentEducationHistory.studentId, existingProfile.id)).limit(1)
      ])

      const hasBasicInfo = !!(existingProfile.firstName && existingProfile.lastName && existingProfile.bio)
      const hasInterests = interests.length > 0
      const hasEducation = education.length > 0

      onboardingCompleted = hasBasicInfo && hasInterests && hasEducation

      console.log('🔐 [API] Onboarding check:', { hasBasicInfo, hasInterests, hasEducation, onboardingCompleted })

    } else if (existingProfile.role === 'mentor') {
      const [mentorProfile] = await db
        .select({ onboardingCompleted: mentorProfiles.onboardingCompleted })
        .from(mentorProfiles)
        .where(eq(mentorProfiles.id, existingProfile.id))
        .limit(1)

      onboardingCompleted = mentorProfile?.onboardingCompleted || false

    } else if (existingProfile.role === 'institution') {
      const [institutionProfile] = await db
        .select({ onboardingCompleted: institutionProfiles.onboardingCompleted })
        .from(institutionProfiles)
        .where(eq(institutionProfiles.id, existingProfile.id))
        .limit(1)

      onboardingCompleted = institutionProfile?.onboardingCompleted || false
    }

    const dbDuration = Date.now() - dbStartTime
    console.log(`🔐 [API] Profile check completed in ${dbDuration}ms`)

    // Redirect based on role and onboarding status
    let redirectUrl = 'https://pathpiper.com'

    if (!onboardingCompleted) {
      if (existingProfile.role === 'mentor') {
        redirectUrl += '/mentor-onboarding'
      } else if (existingProfile.role === 'institution') {
        redirectUrl += '/institution/profile'
      } else {
        redirectUrl += '/onboarding'
      }
    } else {
      if (existingProfile.role === 'student') {
        redirectUrl += '/feed'
      } else if (existingProfile.role === 'mentor') {
        redirectUrl += '/mentor/profile'
      } else if (existingProfile.role === 'institution') {
        redirectUrl += '/institution/profile'
      } else {
        redirectUrl += '/feed'
      }
    }

    const totalDuration = Date.now() - startTime
    console.log(`🔐 [API] Callback completed in ${totalDuration}ms - redirecting to:`, redirectUrl)

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('🔐 [API] Callback error after', totalDuration + 'ms:', error)

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=server`)
  }
}