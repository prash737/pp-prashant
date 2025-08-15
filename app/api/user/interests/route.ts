import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, interests } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (!Array.isArray(interests)) {
      return NextResponse.json({ error: 'Interests must be an array' }, { status: 400 })
    }

    // Get user's current age group - optimized single query
    const profileData = await prisma.profile.findUnique({
      where: { id: userId },
      select: { 
        role: true,
        student: {
          select: { age_group: true }
        }
      }
    })

    let ageGroup = 'young_adult' // default
    if (profileData?.role === 'student' && profileData.student?.age_group) {
      ageGroup = profileData.student.age_group
    }

    // Get available interests and custom category in parallel
    const [availableInterests, customInterestCategory] = await Promise.all([
      prisma.interest.findMany({
        where: {
          category: {
            ageGroup: ageGroup as any
          }
        },
        select: {
          id: true,
          name: true
        }
      }),
      prisma.interestCategory.findFirst({
        where: {
          name: 'Custom',
          ageGroup: ageGroup as any
        }
      })
    ])

    const availableInterestIds = availableInterests.map(interest => interest.id)
    const availableInterestNamesMap = new Map(availableInterests.map(interest => [interest.name, interest.id]))

    // Create custom category if it doesn't exist
    let finalCustomCategory = customInterestCategory
    if (!customInterestCategory) {
      finalCustomCategory = await prisma.interestCategory.create({
        data: {
          name: 'Custom',
          ageGroup: ageGroup as any
        }
      })
    }

    // Process custom interests and create them in database
    const customInterestsToCreate = []
    for (const interest of interests) {
      const interestName = typeof interest === 'object' ? interest.name : interest

      if (!availableInterestNamesMap.has(interestName)) {
        // Check if this custom interest already exists
        const existingCustomInterest = await prisma.interest.findFirst({
          where: {
            name: interestName,
            categoryId: finalCustomCategory!.id
          }
        })

        if (!existingCustomInterest) {
          customInterestsToCreate.push({
            name: interestName,
            categoryId: finalCustomCategory!.id
          })
        } else {
          // Add existing custom interest to our maps
          availableInterestIds.push(existingCustomInterest.id)
          availableInterestNamesMap.set(interestName, existingCustomInterest.id)
        }
      }
    }

    // Batch create custom interests
    if (customInterestsToCreate.length > 0) {
      const newCustomInterests = await prisma.interest.createMany({
        data: customInterestsToCreate
      })

      // Fetch the created interests to get their IDs
      const createdInterests = await prisma.interest.findMany({
        where: {
          name: { in: customInterestsToCreate.map(i => i.name) },
          categoryId: finalCustomCategory!.id
        },
        select: { id: true, name: true }
      })

      // Add to our maps
      createdInterests.forEach(interest => {
        availableInterestIds.push(interest.id)
        availableInterestNamesMap.set(interest.name, interest.id)
      })
    }

    // Filter valid interests
    const validInterests = interests.filter(interest => {
      const interestName = typeof interest === 'object' ? interest.name : interest
      return availableInterestNamesMap.has(interestName)
    })

    // Get current user interests and perform updates in parallel
    const currentUserInterests = await prisma.userInterest.findMany({
      where: { userId: userId },
      include: { interest: { select: { name: true, id: true } } }
    })

    const currentInterestNames = currentUserInterests.map(ui => ui.interest.name)
    const currentInterestIds = currentUserInterests.map(ui => ui.interest.id)

    // Find interests to add and remove
    const interestsToAdd = validInterests.filter(interest => !currentInterestNames.includes(interest))
    const interestsToRemove = currentUserInterests.filter(ui => 
      !validInterests.includes(ui.interest.name) || !availableInterestIds.includes(ui.interest.id)
    )

    // Execute removals and additions in parallel
    const operations = []

    if (interestsToRemove.length > 0) {
      operations.push(
        prisma.userInterest.deleteMany({
          where: {
            userId: userId,
            interestId: {
              in: interestsToRemove.map(ui => ui.interest.id)
            }
          },
        })
      )
    }

    if (interestsToAdd.length > 0) {
      const userInterestData = interestsToAdd
        .map(interestName => {
          const interestId = availableInterestNamesMap.get(interestName)
          return interestId ? {
            userId: userId,
            interestId: interestId,
          } : null
        })
        .filter(Boolean) as { userId: string; interestId: number }[]

      if (userInterestData.length > 0) {
        operations.push(
          prisma.userInterest.createMany({
            data: userInterestData,
          })
        )
      }
    }

    // Execute all operations in parallel
    if (operations.length > 0) {
      await Promise.all(operations)
    }

    return NextResponse.json({ message: 'Interests saved successfully' })
  } catch (error) {
    console.error('Error saving user interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    let userId = searchParams.get('userId')

    // If no userId in query params, try to get from cookies
    if (!userId) {
      const cookieStore = request.cookies
      userId = cookieStore.get('sb-user-id')?.value
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user's age group and interests in parallel - optimized query
    const [profileData, userInterests] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: userId },
        select: { 
          role: true,
          student: {
            select: { age_group: true }
          }
        }
      }),
      prisma.userInterest.findMany({
        where: { userId: userId },
        include: {
          interest: {
            select: {
              id: true,
              name: true,
              categoryId: true,
            },
          },
        },
      })
    ])

    let ageGroup = 'young_adult' // default
    if (profileData?.role === 'student' && profileData.student?.age_group) {
      ageGroup = profileData.student.age_group
    }

    // Get available interests for current age group
    const availableInterests = await prisma.interest.findMany({
      where: {
        category: {
          ageGroup: ageGroup as any
        }
      },
      select: {
        id: true,
        name: true,
        categoryId: true
      }
    })

    const availableInterestIds = availableInterests.map(interest => interest.id)

    // Filter user interests to only include those valid for current age group
    const validUserInterests = userInterests.filter(ui => 
      availableInterestIds.includes(ui.interest.id)
    )

    const interests = validUserInterests.map(ui => ({
      id: ui.interest.id,
      name: ui.interest.name,
      categoryId: ui.interest.categoryId
    }))

    // Clean up interests from other age groups if found
    if (userInterests.length > interests.length) {
      const invalidInterestIds = userInterests
        .filter(ui => !availableInterestIds.includes(ui.interest.id))
        .map(ui => ui.interest.id)

      // Remove invalid interests in background (don't await to maintain speed)
      prisma.userInterest.deleteMany({
        where: {
          userId: userId,
          interestId: {
            in: invalidInterestIds
          }
        }
      }).catch(console.error) // Log errors but don't fail the request
    }

    return NextResponse.json({ interests })
  } catch (error) {
    console.error('Error fetching user interests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}