
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Decode token to get student email and ID
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    const [studentEmail, studentId, timestamp] = decodedToken.split(':')

    if (!studentEmail || !studentId || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token format' },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenTimestamp = parseInt(timestamp)
    const currentTime = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (currentTime - tokenTimestamp > twentyFourHours) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Find student profile using Drizzle
    const [studentProfile] = await db
      .select({ 
        firstName: profiles.firstName, 
        lastName: profiles.lastName, 
        email: profiles.email,
        emailVerified: profiles.emailVerified 
      })
      .from(profiles)
      .where(eq(profiles.id, studentId))
      .limit(1)

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 400 }
      )
    }

    if (studentProfile.email !== studentEmail) {
      return NextResponse.json(
        { success: false, error: 'Email mismatch' },
        { status: 400 }
      )
    }

    // Update email verification status using Drizzle
    await db
      .update(profiles)
      .set({ emailVerified: true })
      .where(eq(profiles.id, studentId))

    const duration = Date.now() - startTime
    console.log(`✅ Student email verified successfully for: ${studentEmail} (${duration}ms)`)

    // Redirect to login page with success message
    return NextResponse.redirect(new URL('/login?email_verified=true', 'https://pathpiper.com'))

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ Student email verification error (${duration}ms):`, error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
