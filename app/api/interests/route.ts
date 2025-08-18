
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { profiles, studentProfiles, interestCategories, interests } from '@/lib/drizzle/schema'
import { eq, asc } from 'drizzle-orm'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const ageGroupParam = searchParams.get('ageGroup')

    // Get user's role for age group determination
    const profile = await db.select({
      role: profiles.role
    }).from(profiles).where(eq(profiles.id, user.id)).limit(1)

    if (!profile.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let ageGroup = null

    // For parent requests, validate parent profile and use provided age group
    if (parentId) {
      // For parent requests, use the provided age group parameter
      ageGroup = ageGroupParam
    } else if (profile[0].role === 'student') {
      // Get student's age group
      const studentProfile = await db.select({
        ageGroup: studentProfiles.ageGroup
      }).from(studentProfiles).where(eq(studentProfiles.id, user.id)).limit(1)

      if (studentProfile.length) {
        ageGroup = studentProfile[0].ageGroup
      }
    }

    if (!ageGroup) {
      return NextResponse.json({ error: 'Age group not found' }, { status: 400 })
    }

    // Fetch interest categories and interests for the specified age group
    const categoriesWithInterests = await db.select({
      categoryId: interestCategories.id,
      categoryName: interestCategories.name,
      interestId: interests.id,
      interestName: interests.name
    }).from(interestCategories)
      .leftJoin(interests, eq(interests.categoryId, interestCategories.id))
      .where(eq(interestCategories.ageGroup, ageGroup))
      .orderBy(asc(interestCategories.name), asc(interests.name))

    // Group interests by category
    const categoriesMap = new Map()

    categoriesWithInterests.forEach(row => {
      if (!categoriesMap.has(row.categoryId)) {
        categoriesMap.set(row.categoryId, {
          name: row.categoryName,
          interests: []
        })
      }

      if (row.interestId && row.interestName) {
        categoriesMap.get(row.categoryId).interests.push({
          id: row.interestId,
          name: row.interestName
        })
      }
    })

    // Convert map to array format matching Prisma response
    const formattedCategories = Array.from(categoriesMap.values())

    return NextResponse.json(formattedCategories)

  } catch (error) {
    console.error('Error fetching interests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interests' },
      { status: 500 }
    )
  }
}
