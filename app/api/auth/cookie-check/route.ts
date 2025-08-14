import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Cookie validation check started')

    const cookieStore = await cookies()

    // Get all authentication-related cookies
    const authCookies = {
      accessToken: cookieStore.get('sb-access-token')?.value,
      refreshToken: cookieStore.get('sb-refresh-token')?.value,
      userId: cookieStore.get('sb-user-id')?.value
    }

    console.log('API: Found cookies:', {
      hasAccessToken: !!authCookies.accessToken,
      hasRefreshToken: !!authCookies.refreshToken,
      hasUserId: !!authCookies.userId
    })

    // Check if we have the essential cookies
    const hasBasicAuth = authCookies.accessToken && authCookies.userId

    if (!hasBasicAuth) {
      console.log('API: Missing essential authentication cookies')
      return NextResponse.json({
        hasValidAuth: false,
        cookies: authCookies,
        timestamp: new Date().toISOString(),
        reason: 'Missing essential cookies'
      })
    }

    // Verify user exists in database
    if (authCookies.userId) {
      console.log('API: Verifying user exists in database:', authCookies.userId)

      const userExists = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.id, authCookies.userId))
        .limit(1)

      if (!userExists.length) {
        console.log('API: User not found in database')
        return NextResponse.json({
          hasValidAuth: false,
          cookies: authCookies,
          timestamp: new Date().toISOString(),
          reason: 'User not found in database'
        })
      }

      console.log('API: User validation successful')
    }

    return NextResponse.json({
      hasValidAuth: hasBasicAuth,
      cookies: authCookies,
      timestamp: new Date().toISOString(),
      status: 'valid'
    })

  } catch (error) {
    console.error('API: Cookie check error:', error)
    return NextResponse.json(
      { 
        hasValidAuth: false, 
        error: 'Cookie check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}