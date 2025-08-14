
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const iterations = 5
  const results = []
  
  console.log('🧪 [PERF] Starting register API performance test...')
  
  for (let i = 1; i <= iterations; i++) {
    const testEmail = `test.register.${Date.now()}.${i}@example.com`
    
    const startTime = Date.now()
    
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'User',
          email: testEmail,
          password: 'TestPassword123!',
          role: 'student',
          birthMonth: '6',
          birthYear: '2000'
        }),
      })
      
      const duration = Date.now() - startTime
      const data = await response.json()
      
      results.push({
        iteration: i,
        duration: `${duration}ms`,
        status: response.status,
        success: data.success || false
      })
      
      console.log(`🧪 [PERF] Register test ${i}: ${duration}ms`)
      
    } catch (error) {
      const duration = Date.now() - startTime
      results.push({
        iteration: i,
        duration: `${duration}ms`,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  const avgDuration = results
    .filter(r => typeof r.duration === 'string' && r.duration.includes('ms'))
    .map(r => parseInt(r.duration))
    .reduce((sum, val) => sum + val, 0) / results.length
  
  console.log(`🧪 [PERF] Register API average: ${avgDuration.toFixed(0)}ms`)
  
  return NextResponse.json({
    testType: 'register-api-performance',
    timestamp: new Date().toISOString(),
    iterations,
    averageDuration: `${avgDuration.toFixed(0)}ms`,
    results,
    recommendation: avgDuration < 500 ? 'Excellent performance' : 
                   avgDuration < 1000 ? 'Good performance' : 
                   'Needs optimization'
  })
}
