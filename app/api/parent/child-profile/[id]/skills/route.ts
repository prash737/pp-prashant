
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    // Get child's student profile to calculate age group
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: childId },
      select: { 
        birthMonth: true, 
        birthYear: true,
        age_group: true 
      }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { success: false, error: 'Student profile not found' },
        { status: 404 }
      )
    }

    // Calculate age group from birth data (same logic as student edit profile)
    const calculateAgeGroup = (birthMonth: string | null, birthYear: string | null): string => {
      if (!birthMonth || !birthYear) return "young_adult"

      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1

      const birthYearNum = parseInt(birthYear)
      const birthMonthNum = parseInt(birthMonth)

      let ageInYears = currentYear - birthYearNum
      if (currentMonth < birthMonthNum) {
        ageInYears--
      }

      if (ageInYears < 5) {
        return "early_childhood"
      } else if (ageInYears < 11) {
        return "elementary"
      } else if (ageInYears < 13) {
        return "middle_school"
      } else if (ageInYears < 18) {
        return "high_school"
      } else {
        return "young_adult"
      }
    }

    const ageGroup = calculateAgeGroup(studentProfile.birthMonth, studentProfile.birthYear)

    console.log('🔍 Parent fetching skills for child:', childId)
    console.log('   - Birth Month:', studentProfile.birthMonth)
    console.log('   - Birth Year:', studentProfile.birthYear)
    console.log('   - Calculated Age Group:', ageGroup)

    // Map age group names for compatibility
    let mappedAgeGroup = ageGroup
    if (ageGroup.includes('-')) {
      mappedAgeGroup = ageGroup.replace(/-/g, '_')
    }

    // Fetch skill categories and skills for the calculated age group
    const skillCategories = await prisma.skillCategory.findMany({
      where: {
        ageGroup: mappedAgeGroup as any
      },
      include: {
        skills: {
          select: {
            id: true,
            name: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    })

    console.log('✅ Found', skillCategories.length, 'skill categories for age group:', mappedAgeGroup)

    // If no categories found for this age group, try with a fallback
    let finalCategories = skillCategories
    if (skillCategories.length === 0) {
      console.log('⚠️ No categories found for', mappedAgeGroup, ', trying young_adult as fallback')
      finalCategories = await prisma.skillCategory.findMany({
        where: {
          ageGroup: 'young_adult' as any
        },
        include: {
          skills: {
            select: {
              id: true,
              name: true
            },
            orderBy: {
              name: 'asc'
            }
          }
        },
        orderBy: [
          { name: 'asc' }
        ]
      })
      console.log('✅ Found', finalCategories.length, 'fallback categories')
    }

    // Transform the data to match the expected format
    const transformedCategories = finalCategories.map(category => ({
      name: category.name,
      skills: category.skills.map(skill => ({
        id: skill.id,
        name: skill.name
      }))
    }))

    return NextResponse.json({ categories: transformedCategories })

  } catch (error) {
    console.error('Error in GET /api/parent/child-profile/[id]/skills:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
