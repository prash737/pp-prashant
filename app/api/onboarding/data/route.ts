
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { getCachedAuth } from '@/lib/auth-cache';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('⏱️ [ONBOARDING-DATA] Request started');

  try {
    // Step 1: Get and verify authentication (with caching)
    const authStart = Date.now();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      console.log('❌ [AUTH] No access token found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getCachedAuth(accessToken, supabase);
    if (!user) {
      console.log('❌ [AUTH] Invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`⏱️ [AUTH] Completed in ${Date.now() - authStart}ms`);

    // Step 2: Parallel data fetching
    const dataStart = Date.now();
    
    const [
      profile,
      goals,
      interests,
      skills,
      education
    ] = await Promise.all([
      // Profile with student data
      prisma.profile.findUnique({
        where: { id: user.id },
        include: {
          student: true,
          userInterests: {
            include: {
              interest: {
                include: {
                  category: true
                }
              }
            }
          },
          userSkills: {
            include: {
              skill: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      }),

      // Goals
      prisma.goal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      }),

      // Available interests for age group
      (async () => {
        // Get user's age group first
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { id: user.id },
          select: { age_group: true }
        });
        
        const ageGroup = studentProfile?.age_group || 'young_adult';
        
        return prisma.interest.findMany({
          where: {
            category: {
              ageGroup: ageGroup as any
            }
          },
          include: {
            category: true
          }
        });
      })(),

      // Available skills for age group
      (async () => {
        // Get user's age group first
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { id: user.id },
          select: { age_group: true }
        });
        
        const ageGroup = studentProfile?.age_group || 'young_adult';
        
        return prisma.skill.findMany({
          where: {
            category: {
              ageGroup: ageGroup as any
            }
          },
          include: {
            category: true
          }
        });
      })(),

      // Education history
      prisma.studentEducationHistory.findMany({
        where: { studentId: user.id },
        include: {
          institutionType: {
            include: {
              category: true
            }
          }
        },
        orderBy: { startDate: 'desc' }
      })
    ]);

    console.log(`⏱️ [DATA] Parallel fetch completed in ${Date.now() - dataStart}ms`);

    // Step 3: Format response data
    const formatStart = Date.now();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check onboarding completion
    const hasBasicInfo = !!(profile.firstName && profile.lastName && profile.bio);
    const hasInterests = profile.userInterests.length > 0;
    const hasEducation = education.length > 0;
    const onboardingCompleted = hasBasicInfo && hasInterests && hasEducation;

    const responseData = {
      user: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: user.email,
        role: profile.role,
        bio: profile.bio,
        location: profile.location,
        profileImageUrl: profile.profileImageUrl,
        onboardingCompleted,
        // Student-specific data
        ...(profile.student && {
          educationLevel: profile.student.educationLevel,
          birthMonth: profile.student.birthMonth?.toString() || '',
          birthYear: profile.student.birthYear?.toString() || '',
          ageGroup: profile.student.age_group,
        })
      },
      goals: goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        timeframe: goal.timeframe,
        completed: goal.completed
      })),
      userInterests: profile.userInterests.map(ui => ({
        id: ui.interest.id,
        name: ui.interest.name,
        categoryName: ui.interest.category?.name
      })),
      userSkills: profile.userSkills.map(us => ({
        skill_id: us.skillId,
        proficiency_level: us.proficiencyLevel,
        skills: {
          id: us.skill.id,
          name: us.skill.name,
          skill_categories: {
            name: us.skill.category.name,
            age_group: us.skill.category.ageGroup
          }
        }
      })),
      availableInterests: interests.map(interest => ({
        id: interest.id,
        name: interest.name,
        categoryId: interest.categoryId,
        categoryName: interest.category?.name
      })),
      availableSkills: skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        categoryId: skill.categoryId,
        categoryName: skill.category?.name
      })),
      education: education.map(edu => ({
        id: edu.id,
        institutionName: edu.institutionName,
        institutionTypeId: edu.institutionTypeId,
        institutionTypeName: edu.institutionType?.name,
        institutionCategoryName: edu.institutionType?.category?.name,
        degreeProgram: edu.degreeProgram,
        fieldOfStudy: edu.fieldOfStudy,
        subjects: edu.subjects,
        startDate: edu.startDate?.toISOString().split('T')[0],
        endDate: edu.endDate?.toISOString().split('T')[0],
        isCurrent: edu.isCurrent,
        gradeLevel: edu.gradeLevel,
        institutionVerified: edu.institutionVerified
      }))
    };

    console.log(`⏱️ [FORMAT] Data formatting completed in ${Date.now() - formatStart}ms`);
    console.log(`✅ [ONBOARDING-DATA] Total request completed in ${Date.now() - startTime}ms`);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`❌ [ONBOARDING-DATA] Error after ${Date.now() - startTime}ms:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
