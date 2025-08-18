import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { profiles, studentProfiles, interestCategories, interests, userInterests } from '@/lib/drizzle/schema'
import { eq, asc, inArray } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client and verify token
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role
    const profile = await db.select({
      role: profiles.role
    }).from(profiles).where(eq(profiles.id, user.id)).limit(1)

    if (!profile.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let ageGroup = null

    if (profile[0].role === 'student') {
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

    // Get available interest categories for age group filtering
    const availableCategories = await db.select({
      id: interestCategories.id,
      name: interestCategories.name
    }).from(interestCategories)
      .leftJoin(interests, eq(interests.categoryId, interestCategories.id))
      .where(eq(interestCategories.ageGroup, ageGroup))

    const availableInterestNames = new Set()
    for (const category of availableCategories) {
      const categoryInterests = await db.select({
        name: interests.name
      }).from(interests).where(eq(interests.categoryId, category.id))

      categoryInterests.forEach(interest => {
        availableInterestNames.add(interest.name)
      })
    }

    // Get user's current interests with details
    const currentUserInterests = await db.select({
      userInterestId: userInterests.id,
      interestId: interests.id,
      interestName: interests.name,
      categoryId: interests.categoryId
    }).from(userInterests)
      .innerJoin(interests, eq(interests.id, userInterests.interestId))
      .where(eq(userInterests.userId, user.id))

    // Get all available interests for user's current age group
    const availableInterests = await db.select({
      id: interests.id,
      name: interests.name,
      categoryId: interests.categoryId
    }).from(interests)
      .innerJoin(interestCategories, eq(interestCategories.id, interests.categoryId))
      .where(eq(interestCategories.ageGroup, ageGroup))

    // Filter valid interests (those that exist in current age group)
    const validInterests = currentUserInterests.filter(userInterest => 
      availableInterestNames.has(userInterest.interestName)
    )

    // Find invalid interests to cleanup
    const invalidInterestIds = currentUserInterests
      .filter(userInterest => !availableInterestNames.has(userInterest.interestName))
      .map(userInterest => userInterest.interestId)

    // Cleanup invalid interests if any exist
    if (invalidInterestIds.length > 0) {
      await db.delete(userInterests)
        .where(
          eq(userInterests.userId, user.id) && 
          inArray(userInterests.interestId, invalidInterestIds)
        )
    }

    // Format response to match frontend expectations
    const formattedInterests = validInterests.map(userInterest => ({
      id: userInterest.interestId,
      name: userInterest.interestName,
      categoryId: userInterest.categoryId
    }))

    return NextResponse.json({ interests: formattedInterests })

  } catch (error) {
    console.error('Error fetching user interests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user interests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client and verify token
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { interests: selectedInterests } = await request.json()

    if (!Array.isArray(selectedInterests)) {
      return NextResponse.json({ error: 'Invalid interests format' }, { status: 400 })
    }

    // Get user's role and age group
    const profile = await db.select({
      role: profiles.role
    }).from(profiles).where(eq(profiles.id, user.id)).limit(1)

    if (!profile.length) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let ageGroup = null

    if (profile[0].role === 'student') {
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

    // Get available interests for user's age group
    const availableInterests = await db.select({
      id: interests.id,
      name: interests.name
    }).from(interests)
      .innerJoin(interestCategories, eq(interestCategories.id, interests.categoryId))
      .where(eq(interestCategories.ageGroup, ageGroup))

    const availableInterestMap = new Map()
    availableInterests.forEach(interest => {
      availableInterestMap.set(interest.name, interest.id)
    })

    // Get or create custom interest category for this age group
    let customCategory = await db.select({
      id: interestCategories.id
    }).from(interestCategories)
      .where(
        eq(interestCategories.name, 'Custom') && 
        eq(interestCategories.ageGroup, ageGroup)
      ).limit(1)

    if (!customCategory.length) {
      const newCategory = await db.insert(interestCategories).values({
        name: 'Custom',
        ageGroup: ageGroup
      }).returning({ id: interestCategories.id })

      customCategory = newCategory
    }

    const customCategoryId = customCategory[0].id

    // Process interests and create custom ones if needed
    const interestIds = []

    for (const interestName of selectedInterests) {
      if (availableInterestMap.has(interestName)) {
        // Existing interest
        interestIds.push(availableInterestMap.get(interestName))
      } else {
        // Check if custom interest already exists
        const existingCustom = await db.select({
          id: interests.id
        }).from(interests)
          .where(
            eq(interests.name, interestName) && 
            eq(interests.categoryId, customCategoryId)
          ).limit(1)

        if (existingCustom.length) {
          interestIds.push(existingCustom[0].id)
        } else {
          // Create new custom interest
          const newInterest = await db.insert(interests).values({
            name: interestName,
            categoryId: customCategoryId
          }).returning({ id: interests.id })

          interestIds.push(newInterest[0].id)
        }
      }
    }

    // Get currently saved user interests
    const currentUserInterests = await db.select({
      id: userInterests.id,
      interestId: userInterests.interestId,
      interestName: interests.name
    }).from(userInterests)
      .innerJoin(interests, eq(interests.id, userInterests.interestId))
      .where(eq(userInterests.userId, user.id))

    // Find interests to remove (those not in the new selection)
    const interestsToRemove = currentUserInterests.filter(
      ui => !interestIds.includes(ui.interestId)
    )

    // Remove interests that are no longer selected
    if (interestsToRemove.length > 0) {
      const idsToRemove = interestsToRemove.map(ui => ui.interestId)
      await db.delete(userInterests)
        .where(
          eq(userInterests.userId, user.id) && 
          inArray(userInterests.interestId, idsToRemove)
        )
    }

    // Find new interests to add
    const currentInterestIds = currentUserInterests.map(ui => ui.interestId)
    const newInterestIds = interestIds.filter(id => !currentInterestIds.includes(id))

    // Add new interests
    if (newInterestIds.length > 0) {
      const userInterestData = newInterestIds.map(interestId => ({
        userId: user.id,
        interestId: interestId
      }))

      await db.insert(userInterests).values(userInterestData)
    }

    return NextResponse.json({ 
      message: 'Interests updated successfully',
      added: newInterestIds.length,
      removed: interestsToRemove.length
    })

  } catch (error) {
    console.error('Error updating user interests:', error)
    return NextResponse.json(
      { error: 'Failed to update user interests' },
      { status: 500 }
    )
  }
}