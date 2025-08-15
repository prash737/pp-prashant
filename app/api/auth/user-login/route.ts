import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { loginUser } from '@/lib/services/auth-service';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First, authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    console.log('🔍 Authenticated user ID:', userId);

    // Check if user exists in student_profiles table
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            userInterests: true,
          }
        },
        educationHistory: true
      }
    });

    if (studentProfile) {
      console.log('✅ Found student profile');

      // Check verification status for students under 16
      if (studentProfile.birthYear && studentProfile.birthMonth) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const birthYear = parseInt(studentProfile.birthYear);
        const birthMonth = parseInt(studentProfile.birthMonth);

        let ageInYears = currentYear - birthYear;
        if (currentMonth < birthMonth) {
          ageInYears--;
        }

        // Check if student is under 16 and verification status
        if (ageInYears < 16) {
          const isParentVerified = studentProfile.profile.parentVerified || false;
          const isEmailVerified = studentProfile.profile.emailVerified || false;

          // Check verification status and return appropriate response
          if (!isParentVerified || !isEmailVerified) {
            return NextResponse.json({
              success: false,
              error: "Verification required",
              needsParentApproval: !isParentVerified,
              needsEmailVerification: !isEmailVerified
            }, { status: 403 });
          }
        }
      }

      // Check onboarding completion for student
      const hasBasicInfo = studentProfile.profile.firstName &&
                         studentProfile.profile.lastName &&
                         studentProfile.profile.bio;

      const hasInterests = studentProfile.profile.userInterests &&
                         studentProfile.profile.userInterests.length > 0;

      const hasEducation = studentProfile.educationHistory &&
                         studentProfile.educationHistory.length > 0;

      const onboardingCompleted = hasBasicInfo && hasInterests && hasEducation;

      console.log('🔍 Student onboarding check:', {
        hasBasicInfo,
        hasInterests,
        hasEducation,
        onboardingCompleted
      });

      // Set session cookies for student
      const response = NextResponse.json({
        success: true,
        userType: 'student',
        role: 'student',
        onboardingCompleted,
        userId: authData.user.id,
        email: authData.user.email,
        name: `${studentProfile.profile.firstName || ''} ${studentProfile.profile.lastName || ''}`.trim()
      });

      // Set session cookies
      if (authData.session) {
        response.cookies.set('sb-access-token', authData.session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: authData.session.expires_in || 3600,
          path: '/',
        });

        response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });

        response.cookies.set('sb-user-id', authData.user.id, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: authData.session.expires_in || 3600,
          path: '/',
        });
      }

      // For students, redirect based on onboarding status
      // Since we know this is a student (we're in the studentProfile block)
      const redirectPath = onboardingCompleted ? `/student/profile/${authData.user.id}` : '/onboarding'
        
      return response;
    }

    // Check if user exists in parent_profile table
    const parentProfile = await prisma.parentProfile.findFirst({
      where: { auth_id: userId }
    });

    if (parentProfile) {
      console.log('✅ Found parent profile');

      // Set session cookies for parent
      const response = NextResponse.json({
        success: true,
        userType: 'parent',
        role: 'parent',
        userId: authData.user.id,
        parentId: parentProfile.id,
        email: authData.user.email,
        name: parentProfile.name
      });

      // Set parent-specific session cookies
      response.cookies.set('parent_id', parentProfile.id, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      response.cookies.set('parent_session', authData.session?.access_token || '', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      if (authData.session) {
        response.cookies.set('sb-access-token', authData.session.access_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: authData.session.expires_in || 3600,
          path: '/',
        });

        response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });
      }

      return response;
    }

    // If user not found in either table
    console.log('❌ User not found in student_profiles or parent_profile tables');
    return NextResponse.json(
      { success: false, error: 'Account not found. Please contact support.' },
      { status: 404 }
    );

  } catch (error) {
    console.error('User login API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}