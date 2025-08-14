
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { profiles, studentProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test profile lookup performance
    const testUserId = '006a3d59-ec4d-42e6-aee4-d04f1d0caf2b' // Use your actual test user ID
    
    console.log('🧪 [Login Performance Test] Starting profile lookup test...')
    
    const profileStartTime = Date.now()
    const userProfile = await db
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
      .where(eq(profiles.id, testUserId))
      .limit(1)
    
    const profileDuration = Date.now() - profileStartTime
    console.log(`🧪 [Login Performance Test] Profile lookup: ${profileDuration}ms`)

    // Test student profile lookup if user is a student
    let studentCheckDuration = 0
    if (userProfile.length > 0 && userProfile[0].role === 'student') {
      const studentStartTime = Date.now()
      
      const studentProfile = await db
        .select({
          id: studentProfiles.id,
        })
        .from(studentProfiles)
        .where(eq(studentProfiles.studentId, testUserId))
        .limit(1)
      
      studentCheckDuration = Date.now() - studentStartTime
      console.log(`🧪 [Login Performance Test] Student check: ${studentCheckDuration}ms`)
    }

    const totalDuration = Date.now() - startTime
    
    const results = {
      timestamp: new Date().toISOString(),
      totalDuration,
      breakdown: {
        profileLookup: profileDuration,
        studentCheck: studentCheckDuration,
      },
      userFound: userProfile.length > 0,
      userRole: userProfile.length > 0 ? userProfile[0].role : null,
      performance: {
        excellent: totalDuration < 100,
        good: totalDuration < 300,
        acceptable: totalDuration < 500,
        needsOptimization: totalDuration >= 500
      }
    }

    console.log('🧪 [Login Performance Test] Results:', results)

    return NextResponse.json({
      success: true,
      test: 'login-api-performance',
      results
    })

  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('🧪 [Login Performance Test] Error after', totalDuration + 'ms:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: totalDuration
    }, { status: 500 })
  }
}
