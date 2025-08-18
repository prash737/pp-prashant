import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { profiles, studentProfiles, interestCategories, interests, userInterests } from '@/lib/drizzle/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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

    // Get student's age group if user is a student
    if (profile[0].role === 'student') {
      const studentProfile = await db.select({
        ageGroup: studentProfiles.ageGroup
      }).from(studentProfiles).where(eq(studentProfiles.id, user.id)).limit(1)

      if (studentProfile.length) {
        ageGroup = studentProfile[0].ageGroup
      }
    }

    // Get available interest categories for age group filtering
    let availableInterestCategories = []
    if (ageGroup) {
      availableInterestCategories = await db.select({
        name: interestCategories.name,
        interests: interests.name
      }).from(interestCategories)
        .leftJoin(interests, eq(interests.categoryId, interestCategories.id))
        .where(eq(interestCategories.ageGroup, ageGroup))
    }

    // Get user's interests with both ID and name
    const currentUserInterests = await db.select({
      id: userInterests.id,
      interestId: userInterests.interestId,
      interestName: interests.name,
      categoryId: interests.categoryId
    }).from(userInterests)
      .innerJoin(interests, eq(interests.id, userInterests.interestId))
      .where(eq(userInterests.userId, user.id))

    // Get all available interests for user's current age group with their IDs
    let availableInterests = []
    if (ageGroup) {
      availableInterests = await db.select({
        id: interests.id,
        name: interests.name,
        categoryId: interests.categoryId
      }).from(interests)
        .innerJoin(interestCategories, eq(interestCategories.id, interests.categoryId))
        .where(eq(interestCategories.ageGroup, ageGroup))
    }

    // Find invalid interests (interests not valid for current age group)
    const validInterestIds = availableInterests.map(interest => interest.id)
    const invalidInterestIds = currentUserInterests
      .filter(ui => !validInterestIds.includes(ui.interestId))
      .map(ui => ui.interestId)

    // Cleanup invalid interests (if user's age group changed)
    if (invalidInterestIds.length > 0) {
      await db.delete(userInterests)
        .where(and(
          eq(userInterests.userId, user.id),
          inArray(userInterests.interestId, invalidInterestIds)
        ))
    }

    // Get updated user interests after cleanup
    const validUserInterests = await db.select({
      id: userInterests.id,
      interestId: userInterests.interestId,
      interestName: interests.name,
      categoryId: interests.categoryId
    }).from(userInterests)
      .innerJoin(interests, eq(interests.id, userInterests.interestId))
      .where(eq(userInterests.userId, user.id))

    // Format response to match Prisma structure
    const formattedInterests = validUserInterests.map(ui => ({
      interest: {
        id: ui.interestId,
        name: ui.interestName,
        categoryId: ui.categoryId
      }
    }))

    return NextResponse.json({
      interests: formattedInterests
    })

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
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { interests: selectedInterests } = await request.json()

    // Get user's current age group
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

    // Get available interests for user's age group
    let availableInterests = []
    if (ageGroup) {
      availableInterests = await db.select({
        id: interests.id,
        name: interests.name
      }).from(interests)
        .innerJoin(interestCategories, eq(interestCategories.id, interests.categoryId))
        .where(eq(interestCategories.ageGroup, ageGroup))
    }

    const availableInterestNames = availableInterests.map(interest => interest.name)
    const interestNameToIdMap = new Map(availableInterests.map(interest => [interest.name, interest.id]))

    // Filter selected interests to only include valid ones for age group
    const validSelectedInterests = selectedInterests.filter((interest: string) => 
      availableInterestNames.includes(interest)
    )

    // Handle custom interests
    const customInterests = selectedInterests.filter((interest: string) => 
      !availableInterestNames.includes(interest)
    )

    // Get or create custom interest category for this age group
    let customInterestCategory = null
    if (customInterests.length > 0 && ageGroup) {
      const existingCustomCategory = await db.select({
        id: interestCategories.id
      }).from(interestCategories)
        .where(and(
          eq(interestCategories.name, 'Custom'),
          eq(interestCategories.ageGroup, ageGroup)
        )).limit(1)

      if (existingCustomCategory.length) {
        customInterestCategory = existingCustomCategory[0]
      } else {
        const newCustomCategory = await db.insert(interestCategories).values({
          name: 'Custom',
          ageGroup: ageGroup
        }).returning({ id: interestCategories.id })

        customInterestCategory = newCustomCategory[0]
      }
    }

    // Create custom interests if they don't exist
    for (const customInterest of customInterests) {
      if (customInterestCategory) {
        const existingCustomInterest = await db.select({
          id: interests.id,
          name: interests.name
        }).from(interests)
          .where(and(
            eq(interests.name, customInterest),
            eq(interests.categoryId, customInterestCategory.id)
          )).limit(1)

        if (!existingCustomInterest.length) {
          const newCustomInterest = await db.insert(interests).values({
            name: customInterest,
            categoryId: customInterestCategory.id
          }).returning({ id: interests.id, name: interests.name })

          interestNameToIdMap.set(customInterest, newCustomInterest[0].id)
        } else {
          interestNameToIdMap.set(customInterest, existingCustomInterest[0].id)
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

    const currentInterestNames = currentUserInterests.map(ui => ui.interestName)

    // Find interests to remove (currently saved but not in new selection)
    const interestsToRemove = currentUserInterests.filter(ui => 
      !selectedInterests.includes(ui.interestName)
    )

    // Find interests to add (in new selection but not currently saved)
    const interestsToAdd = selectedInterests.filter((interestName: string) => 
      !currentInterestNames.includes(interestName) && interestNameToIdMap.has(interestName)
    )

    // Remove interests that are no longer selected
    if (interestsToRemove.length > 0) {
      const interestIdsToRemove = interestsToRemove.map(ui => ui.interestId)
      await db.delete(userInterests)
        .where(and(
          eq(userInterests.userId, user.id),
          inArray(userInterests.interestId, interestIdsToRemove)
        ))
    }

    // Add new interests
    if (interestsToAdd.length > 0) {
      const userInterestData = interestsToAdd.map((interestName: string) => ({
        userId: user.id,
        interestId: interestNameToIdMap.get(interestName)!
      }))

      await db.insert(userInterests).values(userInterestData)
    }

    return NextResponse.json({ 
      message: 'Interests updated successfully',
      added: interestsToAdd.length,
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