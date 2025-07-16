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

    // Decode token to get parent email and student ID
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    const [parentEmail, studentId, timestamp, isRegistered] = decodedToken.split(':')

    if (!parentEmail || !studentId || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token format' },
        { status: 400 }
      )
    }

    // Get student profile to display name in success message
    const studentProfile = await prisma.profile.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
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

    // Find parent profile with matching email and token
    const parentProfile = await prisma.parentProfile.findFirst({
      where: {
        email: parentEmail,
        verificationToken: token
      }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token or parent email' },
        { status: 400 }
      )
    }

    // Clear the verification token (but do NOT set parent_verified to true)
    await prisma.parentProfile.update({
      where: { id: parentProfile.id },
      data: {
        verificationToken: null
      }
    })

    console.log('✅ Parent verification link clicked for student:', studentId)
    console.log('ℹ️ Parent_verified remains FALSE until parent completes registration/login')

    // Redirect based on parent registration status
    const isParentRegistered = isRegistered === 'true'
    const redirectUrl = isParentRegistered ? '/parent/login' : '/parent/signup'
    
    // Use the specific PathPiper deployment domain for redirect
    const baseUrl = 'https://pathpiper.replit.app'
    const urlWithEmail = new URL(redirectUrl, baseUrl)
    urlWithEmail.searchParams.set('email', parentEmail)
    return NextResponse.redirect(urlWithEmail)

  } catch (error) {
    console.error('Parent verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}