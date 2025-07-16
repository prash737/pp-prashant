import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies()
    const accessTokenCookie = cookieStore.get('sb-access-token')
    const parentAuthTokenCookie = cookieStore.get('parent-auth-token')

    // Check if this is a parent or regular user request
    let isParentRequest = false
    
    if (parentAuthTokenCookie) {
      // Parent authentication
      try {
        const parentId = parentAuthTokenCookie.value
        const parentProfile = await prisma.parentProfile.findUnique({
          where: { id: parentId }
        })
        
        if (!parentProfile) {
          return NextResponse.json({ error: 'Invalid parent session' }, { status: 401 })
        }
        
        isParentRequest = true
      } catch (error) {
        return NextResponse.json({ error: 'Invalid parent session' }, { status: 401 })
      }
    } else if (!accessTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')

    if (!ageGroup) {
      return NextResponse.json({ error: 'Age group is required' }, { status: 400 })
    }

    console.log('🔍 Fetching skill categories for age group:', ageGroup)

    // Map age group names for compatibility
    let mappedAgeGroup = ageGroup
    if (ageGroup.includes('-')) {
      mappedAgeGroup = ageGroup.replace(/-/g, '_')
    }
    console.log('🔍 Original age group:', ageGroup)
    console.log('🔍 Mapped age group:', mappedAgeGroup)

    // Fetch skill categories and skills for the age group using Prisma
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

    console.log('✅ Transformed categories:', transformedCategories.map(c => ({ name: c.name, skillCount: c.skills.length })))

    return NextResponse.json({ categories: transformedCategories })
  } catch (error) {
    console.error('Error in GET /api/skills:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}