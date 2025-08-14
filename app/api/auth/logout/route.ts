import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    console.log('API: Logout request received')

    // Clear authentication cookies
    const cookieStore = await cookies()

    // Remove all authentication-related cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token', 
      'sb-user-id'
    ]

    console.log('API: Clearing authentication cookies...')

    // Create response and clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear each cookie
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Immediately expire
        path: '/'
      })
    })

    console.log('API: Logout successful - cookies cleared')

    return response

  } catch (error) {
    console.error('API: Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}