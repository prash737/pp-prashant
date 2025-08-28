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
    console.log('🔍 Drizzle Query: Fetching available categories for age group:', ageGroup)
    const availableCategories = await db.select({
      id: interestCategories.id,
      name: interestCategories.name
    }).from(interestCategories)
      .leftJoin(interests, eq(interests.categoryId, interestCategories.id))
      .where(eq(interestCategories.ageGroup, ageGroup))
    
    console.log('✅ Drizzle Result: Found', availableCategories.length, 'available categories')

    const availableInterestNames = new Set()
    for (const category of availableCategories) {
      console.log('🔍 Drizzle Query: Fetching interests for category:', category.name, 'ID:', category.id)
      const categoryInterests = await db.select({
        name: interests.name
      }).from(interests).where(eq(interests.categoryId, category.id))
      
      console.log('✅ Drizzle Result: Found', categoryInterests.length, 'interests for category:', category.name)
      categoryInterests.forEach(interest => {
        availableInterestNames.add(interest.name)
      })
    }

    // Get user's current interests with details
    console.log('🔍 Drizzle Query: Fetching current user interests for user:', user.id)
    const currentUserInterests = await db.select({
      userInterestId: userInterests.id,
      interestId: interests.id,
      interestName: interests.name,
      categoryId: interests.categoryId
    }).from(userInterests)
      .innerJoin(interests, eq(interests.id, userInterests.interestId))
      .where(eq(userInterests.userId, user.id))
    
    console.log('✅ Drizzle Result: Found', currentUserInterests.length, 'current user interests')

    // Get all available interests for user's current age group
    console.log('🔍 Drizzle Query: Fetching all available interests for age group:', ageGroup)
    const availableInterests = await db.select({
      id: interests.id,
      name: interests.name,
      categoryId: interests.categoryId
    }).from(interests)
      .innerJoin(interestCategories, eq(interestCategories.id, interests.categoryId))
      .where(eq(interestCategories.ageGroup, ageGroup))
    
    console.log('✅ Drizzle Result: Found', availableInterests.length, 'available interests for age group')

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
      console.log('🗑️ Drizzle Query: Cleaning up', invalidInterestIds.length, 'invalid interests for user:', user.id)
      await db.delete(userInterests)
        .where(
          eq(userInterests.userId, user.id) && 
          inArray(userInterests.interestId, invalidInterestIds)
        )
      console.log('✅ Drizzle Result: Cleaned up invalid interests')
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
    console.log('🔍 Drizzle Query: [POST] Fetching available interests for age group:', ageGroup)
    const availableInterests = await db.select({
      id: interests.id,
      name: interests.name
    }).from(interests)
      .innerJoin(interestCategories, eq(interestCategories.id, interests.categoryId))
      .where(eq(interestCategories.ageGroup, ageGroup))
    
    console.log('✅ Drizzle Result: [POST] Found', availableInterests.length, 'available interests')

    const availableInterestMap = new Map()
    availableInterests.forEach(interest => {
      availableInterestMap.set(interest.name, interest.id)
    })

    // Get or create custom interest category for this age group
    console.log('🔍 Drizzle Query: [POST] Looking for Custom category for age group:', ageGroup)
    let customCategory = await db.select({
      id: interestCategories.id
    }).from(interestCategories)
      .where(
        eq(interestCategories.name, 'Custom') && 
        eq(interestCategories.ageGroup, ageGroup)
      ).limit(1)

    if (!customCategory.length) {
      console.log('🔍 Drizzle Query: [POST] Creating new Custom category for age group:', ageGroup)
      const newCategory = await db.insert(interestCategories).values({
        name: 'Custom',
        ageGroup: ageGroup
      }).returning({ id: interestCategories.id })
      
      console.log('✅ Drizzle Result: [POST] Created Custom category with ID:', newCategory[0].id)
      customCategory = newCategory
    } else {
      console.log('✅ Drizzle Result: [POST] Found existing Custom category with ID:', customCategory[0].id)
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
        console.log('🔍 Drizzle Query: [POST] Checking for existing custom interest:', interestName)
        const existingCustom = await db.select({
          id: interests.id
        }).from(interests)
          .where(
            eq(interests.name, interestName) && 
            eq(interests.categoryId, customCategoryId)
          ).limit(1)

        if (existingCustom.length) {
          console.log('✅ Drizzle Result: [POST] Found existing custom interest:', interestName, 'ID:', existingCustom[0].id)
          interestIds.push(existingCustom[0].id)
        } else {
          // Create new custom interest
          console.log('🔍 Drizzle Query: [POST] Creating new custom interest:', interestName)
          const newInterest = await db.insert(interests).values({
            name: interestName,
            categoryId: customCategoryId
          }).returning({ id: interests.id })
          
          console.log('✅ Drizzle Result: [POST] Created custom interest:', interestName, 'ID:', newInterest[0].id)
          interestIds.push(newInterest[0].id)
        }
      }
    }

    // Get currently saved user interests
    console.log('🔍 Drizzle Query: [POST] Fetching currently saved user interests for user:', user.id)
    const currentUserInterests = await db.select({
      id: userInterests.id,
      interestId: userInterests.interestId,
      interestName: interests.name
    }).from(userInterests)
      .innerJoin(interests, eq(interests.id, userInterests.interestId))
      .where(eq(userInterests.userId, user.id))
    
    console.log('✅ Drizzle Result: [POST] Found', currentUserInterests.length, 'currently saved interests')

    // Find interests to remove (those not in the new selection)
    const interestsToRemove = currentUserInterests.filter(
      ui => !interestIds.includes(ui.interestId)
    )

    // Remove interests that are no longer selected
    if (interestsToRemove.length > 0) {
      const idsToRemove = interestsToRemove.map(ui => ui.interestId)
      console.log('🗑️ Drizzle Query: [POST] Removing', interestsToRemove.length, 'interests for user:', user.id)
      await db.delete(userInterests)
        .where(
          eq(userInterests.userId, user.id) && 
          inArray(userInterests.interestId, idsToRemove)
        )
      console.log('✅ Drizzle Result: [POST] Removed interests')
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

      console.log('➕ Drizzle Query: [POST] Adding', newInterestIds.length, 'new interests for user:', user.id)
      await db.insert(userInterests).values(userInterestData)
      console.log('✅ Drizzle Result: [POST] Added new interests')
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