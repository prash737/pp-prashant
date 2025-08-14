
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema/profiles'
import { studentProfiles } from '@/lib/db/schema/students'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔐 [API] Login request started')
  
  try {
    const { email, password } = await request.json()
    console.log('🔐 [API] Login attempt for email:', email?.substring(0, 5) + '***')

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Supabase authentication
    console.log('🔐 [API] Authenticating with Supabase...')
    
    const authStartTime = Date.now()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    const authDuration = Date.now() - authStartTime
    console.log(`🔐 [API] Supabase auth completed in ${authDuration}ms`)

    if (authError) {
      console.log('🔐 [API] Authentication failed:', authError.message)
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      console.log('🔐 [API] No user data returned from Supabase')
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Fetch user profile using Drizzle
    console.log('🔐 [API] Fetching user profile from database...')
    const dbStartTime = Date.now()
    
    let userProfile
    try {
      userProfile = await db
        .select({
          id: profiles.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          email: profiles.email,
          role: profiles.role,
          profileImageUrl: profiles.profileImageUrl,
          bio: profiles.bio,
          onboardingCompleted: profiles.onboardingCompleted,
        })
        .from(profiles)
        .where(eq(profiles.id, authData.user.id))
        .limit(1)
    } catch (dbError) {
      console.error('🔐 [API] Database query error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Database error' },
        { status: 500 }
      )
    }

    const dbDuration = Date.now() - dbStartTime
    console.log(`🔐 [API] Database query completed in ${dbDuration}ms`)
    console.log('🔐 [API] User profile query result:', userProfile)

    if (!userProfile || userProfile.length === 0) {
      console.log('🔐 [API] User profile not found in database')
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    const user = userProfile[0]
    if (!user) {
      console.log('🔐 [API] User object is null/undefined')
      return NextResponse.json(
        { success: false, message: 'User profile data is invalid' },
        { status: 404 }
      )
    }
    console.log('🔐 [API] User profile found:', { 
      id: user?.id, 
      role: user?.role,
      onboardingCompleted: user?.onboardingCompleted 
    })

    // Check onboarding status for students
    let onboardingComplete = user?.onboardingCompleted || false
    if (user?.role === 'student' && !onboardingComplete) {
      console.log('🔐 [API] Checking student onboarding status...')
      
      try {
        const studentProfile = await db
          .select({
            id: studentProfiles.id,
          })
          .from(studentProfiles)
          .where(eq(studentProfiles.studentId, user.id))
          .limit(1)

        onboardingComplete = studentProfile?.length > 0
        console.log('🔐 [API] Student onboarding status:', onboardingComplete)

        // Update profile if onboarding is now complete
        if (onboardingComplete && !user.onboardingCompleted) {
          await db
            .update(profiles)
            .set({ onboardingCompleted: true })
            .where(eq(profiles.id, user.id))
          console.log('🔐 [API] Updated onboarding status to complete')
        }
      } catch (studentError) {
        console.error('🔐 [API] Error checking student profile:', studentError)
        // Continue with original onboarding status if student check fails
      }
    }

    // Set session cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user?.id || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        role: user?.role || '',
        profileImageUrl: user?.profileImageUrl || null,
        bio: user?.bio || null,
        onboardingCompleted: onboardingComplete,
      },
      redirect: onboardingComplete ? (user?.role === 'institution' ? '/institution/profile' : '/feed') : (user?.role === 'institution' ? '/institution-onboarding' : '/onboarding')
    })

    // Set cookies with auth tokens
    if (authData.session) {
      response.cookies.set('accessToken', authData.session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      response.cookies.set('refreshToken', authData.session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })

      response.cookies.set('userId', authData.user.id, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    const totalDuration = Date.now() - startTime
    console.log(`🔐 [API] Login request completed successfully in ${totalDuration}ms`)
    console.log(`🔐 [API] Performance breakdown: Auth=${authDuration}ms, DB=${dbDuration}ms`)

    return response

  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('🔐 [API] Login error after', totalDuration + 'ms:', error)
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
