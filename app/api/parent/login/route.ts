
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify this is a parent account
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { 
        email: email,
        auth_id: authData.user.id 
      }
    })

    if (!parentProfile) {
      return NextResponse.json(
        { success: false, error: 'Parent account not found' },
        { status: 404 }
      )
    }

    // Check if email is verified
    if (!parentProfile.emailVerified) {
      // Send verification email again
      try {
        const verificationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64')
        
        // Update verification token
        await prisma.parentProfile.update({
          where: { id: parentProfile.id },
          data: { verificationToken: verificationToken }
        })

        const baseUrl = 'https://pathpiper.replit.app';
        const verificationLink = `${baseUrl}/api/parent/verify-email?token=${verificationToken}`;
        
        await sendEmail(
          'parent-email-verification',
          email,
          {
            parentName: parentProfile.name,
            verificationLink: verificationLink
          }
        );
        console.log('📧 Parent verification email resent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send parent verification email:', emailError);
      }

      return NextResponse.json({
        success: false,
        error: 'Your email is not verified. We have sent an email for verification. Please click the link and verify to proceed with login.',
        needsVerification: true
      }, { status: 403 })
    }

    // Set authentication cookie
    const cookieStore = await cookies()
    cookieStore.set('parent_session', authData.session?.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    cookieStore.set('parent_id', parentProfile.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    console.log('✅ Parent login successful')

    return NextResponse.json({
      success: true,
      parentId: parentProfile.id.toString(),
      parentName: parentProfile.name
    })

  } catch (error) {
    console.error('Parent login error:', error)
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    )
  }
}
