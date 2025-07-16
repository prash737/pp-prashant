
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // Find student profile
    const studentProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      select: { 
        firstName: true, 
        lastName: true, 
        email: true,
        emailVerified: true 
      }
    })

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

    // Update email verification status
    await prisma.profile.update({
      where: { id: studentId },
      data: { emailVerified: true }
    })

    console.log('✅ Student email verified successfully for:', studentEmail)

    // Redirect to login page with success message
    return NextResponse.redirect(new URL('/login?email_verified=true', 'https://pathpiper.replit.app'))

  } catch (error) {
    console.error('Student email verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
