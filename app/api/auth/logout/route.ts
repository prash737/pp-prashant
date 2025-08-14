
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔐 [API] Logout request started')

  try {
    // Create response immediately
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear all authentication-related cookies in parallel
    const cookiesToClear = [
      'accessToken',
      'refreshToken',
      'userId',
      'sb-access-token',
      'sb-refresh-token', 
      'sb-user-id'
    ]

    // Set all cookies to expire immediately
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      })
    })

    const totalDuration = Date.now() - startTime
    console.log(`🔐 [API] Logout completed successfully in ${totalDuration}ms`)

    return response

  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('🔐 [API] Logout error after', totalDuration + 'ms:', error)
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
