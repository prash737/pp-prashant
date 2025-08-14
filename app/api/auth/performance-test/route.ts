
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? 
      `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
      'http://localhost:3000'
    
    // Test all auth endpoints
    const tests = await Promise.allSettled([
      // Cookie check test
      fetch(`${baseUrl}/api/auth/cookie-check`, {
        headers: { 'Cookie': request.headers.get('Cookie') || '' }
      }).then(res => ({ 
        endpoint: 'cookie-check', 
        status: res.status, 
        time: Date.now() 
      })),
      
      // Token check test
      fetch(`${baseUrl}/api/auth/check-token`, {
        headers: { 
          'Cookie': request.headers.get('Cookie') || '',
          'Authorization': request.headers.get('Authorization') || ''
        }
      }).then(res => ({ 
        endpoint: 'check-token', 
        status: res.status, 
        time: Date.now() 
      })),
      
      // User data test
      fetch(`${baseUrl}/api/auth/user`, {
        headers: { 'Cookie': request.headers.get('Cookie') || '' }
      }).then(res => ({ 
        endpoint: 'user', 
        status: res.status, 
        time: Date.now() 
      }))
    ])
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    const results = tests.map((test, index) => {
      if (test.status === 'fulfilled') {
        return {
          ...test.value,
          responseTime: test.value.time - startTime
        }
      } else {
        return {
          endpoint: ['cookie-check', 'check-token', 'user'][index],
          status: 'error',
          error: test.reason?.message,
          responseTime: totalTime
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      totalTime,
      results,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Performance test failed',
      totalTime: Date.now() - startTime
    }, { status: 500 })
  }
}
