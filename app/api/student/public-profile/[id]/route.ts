
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    console.log('🎓 Fetching public student profile for ID:', studentId);

    // Get student profile with all related data (no authentication required)
    const profile = await prisma.profile.findUnique({
      where: { 
        id: studentId,
        role: 'student'
      },
      include: {
        student: true,
        userInterests: {
          include: {
            interest: true
          }
        },
        userSkills: {
          include: {
            skill: true
          }
        },
        socialLinks: true,
        educationHistory: {
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!profile || !profile.student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    console.log('✅ Public student profile found:', `${profile.firstName} ${profile.lastName}`);

    // Transform data to match the expected format
    const studentData = {
      id: profile.id,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImageUrl: profile.profileImageUrl,
        bio: profile.bio,
        tagline: profile.tagline || profile.bio,
        location: profile.location,
        socialLinks: profile.socialLinks || [],
        userInterests: profile.userInterests || [],
        userSkills: profile.userSkills || []
      },
      ageGroup: profile.student.age_group,
      birthYear: profile.student.birthYear,
      birthMonth: profile.student.birthMonth,
      educationHistory: profile.educationHistory || []
    };

    return NextResponse.json(studentData);

  } catch (error) {
    console.error('Public student profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student profile' },
      { status: 500 }
    );
  }
}
