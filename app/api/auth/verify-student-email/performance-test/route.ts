
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const iterations = 5
    const results = []
    
    // Test with a mock token (will fail verification but tests performance)
    const mockToken = Buffer.from(`test@example.com:test-id:${Date.now()}`).toString('base64')
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-student-email?token=${mockToken}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        const duration = Date.now() - startTime
        results.push({
          iteration: i + 1,
          duration,
          status: response.status,
          success: response.ok
        })
      } catch (error) {
        const duration = Date.now() - startTime
        results.push({
          iteration: i + 1,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })
      }
    }
    
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length
    const maxDuration = Math.max(...results.map(r => r.duration))
    const minDuration = Math.min(...results.map(r => r.duration))
    
    return NextResponse.json({
      success: true,
      endpoint: '/api/auth/verify-student-email',
      results,
      summary: {
        averageDuration: Math.round(avgDuration),
        maxDuration,
        minDuration,
        totalIterations: iterations
      },
      recommendation: avgDuration < 500 ? 'Performance is good' : 'Consider optimization'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Performance test failed'
    }, { status: 500 })
  }
}
