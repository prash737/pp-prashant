import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=auth`);
      }

      if (!data.user) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_user`);
      }

      // Check if user already has a profile
      const existingProfile = await prisma.profile.findUnique({
        where: { id: data.user.id },
      });

      if (!existingProfile) {
        // Create a new profile for this user
        // Extract names from user metadata or email
        const firstName = data.user.user_metadata?.full_name 
          ? data.user.user_metadata.full_name.split(' ')[0] 
          : 'New';
        const lastName = data.user.user_metadata?.full_name 
          ? data.user.user_metadata.full_name.split(' ').slice(1).join(' ') 
          : 'User';

        // Default to student role for social logins
        const role = 'student';

        // Create profile
        const profile = await prisma.profile.create({
          data: {
            id: data.user.id,
            firstName,
            lastName,
            role,
          }
        });

        // Create student profile
        await prisma.studentProfile.create({
          data: {
            id: profile.id,
            age_group: 'young_adult',
            educationLevel: 'undergraduate',
            onboardingCompleted: false
          }
        });

        // Redirect to onboarding
        return NextResponse.redirect('https://pathpiper.replit.app/onboarding');
      } else {
        // Check if minimum required data is present for all three essential sections
        let onboardingCompleted = false;

        if (existingProfile.role === 'student') {
          const studentProfile = await prisma.studentProfile.findUnique({
            where: { id: existingProfile.id },
            include: {
              profile: {
                include: {
                  userInterests: true
                }
              },
              educationHistory: true
            }
          });

          if (studentProfile) {
            // Check 1: Personal Information (first name, last name, bio)
            const hasBasicInfo = !!(existingProfile.firstName && 
                               existingProfile.lastName && 
                               existingProfile.bio);

            // Check 2: Interests (at least one interest)
            const hasInterests = !!(studentProfile.profile.userInterests && 
                               studentProfile.profile.userInterests.length > 0);

            // Check 3: Education History (at least one education entry)
            const hasEducation = !!(studentProfile.educationHistory && 
                               studentProfile.educationHistory.length > 0);

            // Only mark as completed if ALL THREE sections have data
            onboardingCompleted = hasBasicInfo && hasInterests && hasEducation;

            console.log('Callback onboarding check:', {
              hasBasicInfo,
              hasInterests,
              hasEducation,
              onboardingCompleted
            });
          } else {
            onboardingCompleted = false;
          }
        } else if (existingProfile.role === 'mentor') {
          const mentorProfile = await prisma.mentorProfile.findUnique({
            where: { id: existingProfile.id },
          });
          onboardingCompleted = mentorProfile?.onboardingCompleted || false;
        } else if (existingProfile.role === 'institution') {
          const institutionProfile = await prisma.institutionProfile.findUnique({
            where: { id: existingProfile.id },
          });
          onboardingCompleted = institutionProfile?.onboardingCompleted || false;
        }

        // Redirect based on role and onboarding status
        if (!onboardingCompleted) {
          if (existingProfile.role === 'mentor') {
            return NextResponse.redirect('https://pathpiper.replit.app/mentor-onboarding');
          } else if (existingProfile.role === 'institution') {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/institution/profile`);
          } else {
            return NextResponse.redirect('https://pathpiper.replit.app/onboarding');
          }
        } else {
          if (existingProfile.role === 'student') {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/student/profile`);
          } else if (existingProfile.role === 'mentor') {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/mentor/profile`);
          } else if (existingProfile.role === 'institution') {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/institution/profile`);
          } else {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/feed`);
          }
        }
      }
    } catch (error) {
      console.error('Callback error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=server`);
    }
  }

  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/login?error=no_code`);
}