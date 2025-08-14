
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const testResults = []
  
  console.log('🧪 [PERF] Starting auth callback performance simulation...')
  
  // Simulate profile lookup scenarios
  const scenarios = [
    { name: 'New User Profile Creation', userId: 'new-user-' + Date.now() },
    { name: 'Existing Student Profile', userId: '006a3d59-ec4d-42e6-aee4-d04f1d0caf2b' },
    { name: 'Onboarding Check', userId: '006a3d59-ec4d-42e6-aee4-d04f1d0caf2b' }
  ]
  
  for (const scenario of scenarios) {
    const startTime = Date.now()
    
    try {
      // Simulate the database operations that happen in callback
      const { db } = await import('@/lib/db/drizzle')
      const { profiles, userInterests, studentEducationHistory } = await import('@/lib/db/schema')
      const { eq } = await import('drizzle-orm')
      
      // Profile lookup
      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, scenario.userId))
        .limit(1)
      
      if (existingProfile && existingProfile.role === 'student') {
        // Onboarding check queries
        await Promise.all([
          db.select().from(userInterests).where(eq(userInterests.userId, existingProfile.id)).limit(1),
          db.select().from(studentEducationHistory).where(eq(studentEducationHistory.studentId, existingProfile.id)).limit(1)
        ])
      }
      
      const duration = Date.now() - startTime
      
      testResults.push({
        scenario: scenario.name,
        duration: `${duration}ms`,
        status: 'success',
        profileFound: !!existingProfile
      })
      
      console.log(`🧪 [PERF] ${scenario.name}: ${duration}ms`)
      
    } catch (error) {
      const duration = Date.now() - startTime
      testResults.push({
        scenario: scenario.name,
        duration: `${duration}ms`,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  const avgDuration = testResults
    .filter(r => typeof r.duration === 'string' && r.duration.includes('ms'))
    .map(r => parseInt(r.duration))
    .reduce((sum, val) => sum + val, 0) / testResults.length
  
  return NextResponse.json({
    testType: 'auth-callback-performance',
    timestamp: new Date().toISOString(),
    averageDuration: `${avgDuration.toFixed(0)}ms`,
    results: testResults,
    recommendation: avgDuration < 200 ? 'Excellent performance' : 
                   avgDuration < 500 ? 'Good performance' : 
                   'Needs optimization'
  })
}
