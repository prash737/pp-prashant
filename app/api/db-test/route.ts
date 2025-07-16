import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test database connection with a simple query
    const count = await prisma.profile.count();
    console.log("Query Profile.count took", await getQueryTime(() => prisma.profile.count()));

    // Fetch some test data
    const profiles = await prisma.profile.findMany({
      take: 3
    });
    console.log("Query Profile.findMany took", await getQueryTime(() => prisma.profile.findMany({ take: 3 })));

    // Try to get current user's session
    const { data: sessionData } = await supabase.auth.getSession();
    let userData = null;

    if (sessionData?.session?.user) {
      console.log("Found user session for:", sessionData.session.user.id);

      // Try to fetch user profile from Prisma
      const userProfile = await prisma.profile.findUnique({
        where: { id: sessionData.session.user.id },
        include: {
          student: true,
          mentor: true,
          institution: true
        }
      });

      if (userProfile) {
        console.log("Found user profile:", userProfile.firstName, userProfile.lastName);
        userData = {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          role: userProfile.role,
          email: sessionData.session.user.email,
          student: userProfile.student,
          mentor: userProfile.mentor,
          institution: userProfile.institution
        };
      } else {
        console.log("No profile found for user:", sessionData.session.user.id);
      }
    }

    return NextResponse.json({
      success: true,
      database_connected: true,
      profile_count: count,
      sample_profiles: profiles.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        role: p.role
      })),
      current_user: userData
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      database_connected: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}

// Helper to measure query execution time
async function getQueryTime(queryFn: () => Promise<any>): Promise<string> {
  const start = Date.now();
  await queryFn();
  const end = Date.now();
  return `${end - start}ms`;
}