import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      const baseUrl = 'https://pathpiper.replit.app'
      return NextResponse.redirect(new URL('/parent/login?error=invalid_token', baseUrl))
    }

    // Decode token to get email and timestamp
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch (error) {
      const baseUrl = 'https://pathpiper.replit.app'
      return NextResponse.redirect(new URL('/parent/login?error=invalid_token', baseUrl))
    }

    const [email, timestamp] = decodedToken.split(':')

    if (!email || !timestamp) {
      const baseUrl = 'https://pathpiper.replit.app'
      return NextResponse.redirect(new URL('/parent/login?error=invalid_token', baseUrl))
    }

    // Check if token is expired (24 hours)
    const tokenTimestamp = parseInt(timestamp)
    const currentTime = Date.now()
    const twentyFourHours = 24 * 60 * 60 * 1000

    if (currentTime - tokenTimestamp > twentyFourHours) {
      const baseUrl = 'https://pathpiper.replit.app'
      return NextResponse.redirect(new URL('/parent/login?error=token_expired', baseUrl))
    }

    // Find parent profile with matching email and token
    const parentProfile = await prisma.parentProfile.findFirst({
      where: {
        email: email,
        verificationToken: token
      }
    })

    if (!parentProfile) {
      const baseUrl = 'https://pathpiper.replit.app'
      return NextResponse.redirect(new URL('/parent/login?error=invalid_verification', baseUrl))
    }

    // Update parent's email verification status
    await prisma.parentProfile.update({
      where: { id: parentProfile.id },
      data: {
        emailVerified: true,
        verificationToken: null
      }
    })

    console.log('✅ Parent email verified successfully for:', email)

    // Redirect to parent login with success message
    const baseUrl = 'https://pathpiper.replit.app'
    return NextResponse.redirect(new URL('/parent/login?verified=true', baseUrl))

  } catch (error) {
    console.error('Parent email verification error:', error)
    const baseUrl = 'https://pathpiper.replit.app'
    return NextResponse.redirect(new URL('/parent/login?error=verification_failed', baseUrl))
  }
}