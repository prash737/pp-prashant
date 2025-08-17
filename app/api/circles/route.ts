import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { circleBadges, circleMemberships, profiles } from '@/lib/drizzle/schema'
import { eq, or, and, not, inArray } from 'drizzle-orm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('API: Circles request received')

    // Check authentication
    console.log('API: Checking cookies for auth token')
    const cookieStore = await cookies()
    console.log('API: Cookie store available')

    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      console.log('API: No auth token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Token found, verifying with Supabase')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      console.log('API: Auth verification failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    // Run all queries in parallel for better performance
    console.log('🔍 Drizzle Query: Fetching all user circles in parallel')
    const startTime = Date.now()

    const [creatorCircles, memberCircles] = await Promise.all([
      // Get circles where user is creator
      db
        .select({
          id: circleBadges.id,
          name: circleBadges.name,
          description: circleBadges.description,
          color: circleBadges.color,
          icon: circleBadges.icon,
          isDefault: circleBadges.isDefault,
          isDisabled: circleBadges.isDisabled,
          isCreatorDisabled: circleBadges.isCreatorDisabled,
          creatorId: circleBadges.creatorId,
          createdAt: circleBadges.createdAt,
          // Creator profile info
          creatorFirstName: profiles.firstName,
          creatorLastName: profiles.lastName,
          creatorProfileImageUrl: profiles.profileImageUrl
        })
        .from(circleBadges)
        .leftJoin(profiles, eq(circleBadges.creatorId, profiles.id))
        .where(eq(circleBadges.creatorId, user.id)),

      // Get circles where user is a member
      db
        .select({
          id: circleBadges.id,
          name: circleBadges.name,
          description: circleBadges.description,
          color: circleBadges.color,
          icon: circleBadges.icon,
          isDefault: circleBadges.isDefault,
          isDisabled: circleBadges.isDisabled,
          isCreatorDisabled: circleBadges.isCreatorDisabled,
          creatorId: circleBadges.creatorId,
          createdAt: circleBadges.createdAt,
          // Creator profile info
          creatorFirstName: profiles.firstName,
          creatorLastName: profiles.lastName,
          creatorProfileImageUrl: profiles.profileImageUrl
        })
        .from(circleBadges)
        .leftJoin(profiles, eq(circleBadges.creatorId, profiles.id))
        .innerJoin(circleMemberships, eq(circleBadges.id, circleMemberships.circleId))
        .where(
          and(
            eq(circleMemberships.userId, user.id),
            eq(circleMemberships.status, 'active')
          )
        )
    ])

    console.log('✅ Drizzle Result: Creator circles found:', creatorCircles.length)
    console.log('✅ Drizzle Result: Member circles found:', memberCircles.length)

    // Combine and deduplicate circles
    const allCircles = [...creatorCircles, ...memberCircles]
    const uniqueCircles = allCircles.filter((circle, index, self) => 
      index === self.findIndex(c => c.id === circle.id)
    )

    // Sort by isDefault and createdAt
    const userCircles = uniqueCircles.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    // Get memberships only for user's circles (more efficient)
    const circleIds = userCircles.map(circle => circle.id)
    let memberships = []
    
    if (circleIds.length > 0) {
      console.log('🔍 Drizzle Query: Fetching memberships for', circleIds.length, 'circles')
      memberships = await db
        .select({
          circleId: circleMemberships.circleId,
          userId: circleMemberships.userId,
          status: circleMemberships.status,
          isDisabledMember: circleMemberships.isDisabledMember,
          // User profile info
          userFirstName: profiles.firstName,
          userLastName: profiles.lastName,
          userProfileImageUrl: profiles.profileImageUrl,
          userRole: profiles.role,
          userBio: profiles.bio,
          userAvailabilityStatus: profiles.availabilityStatus
        })
        .from(circleMemberships)
        .leftJoin(profiles, eq(circleMemberships.userId, profiles.id))
        .where(
          and(
            eq(circleMemberships.status, 'active'),
            not(eq(circleMemberships.isDisabledMember, true)),
            // Only get memberships for this user's circles
            inArray(circleMemberships.circleId, circleIds)
          )
        )
      
      console.log('✅ Drizzle Result: Total memberships found:', memberships.length)
      console.log('⚡ Query execution time:', Date.now() - startTime, 'ms')
    } else {
      console.log('ℹ️ No circles found, skipping memberships query')
    }

    // Format response to match the expected structure
    const formattedCircles = userCircles.map(circle => {
      const circleMembers = memberships.filter(m => m.circleId === circle.id)

      return {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        color: circle.color,
        icon: circle.icon,
        isDefault: circle.isDefault,
        isDisabled: circle.isDisabled,
        isCreatorDisabled: circle.isCreatorDisabled,
        createdAt: circle.createdAt,
        creator: {
          id: circle.creatorId,
          firstName: circle.creatorFirstName,
          lastName: circle.creatorLastName,
          profileImageUrl: circle.creatorProfileImageUrl
        },
        memberships: circleMembers.map(member => ({
          user: {
            id: member.userId,
            firstName: member.userFirstName,
            lastName: member.userLastName,
            profileImageUrl: member.userProfileImageUrl,
            role: member.userRole,
            bio: member.userBio,
            status: member.userAvailabilityStatus || 'offline'
          },
          isDisabledMember: member.isDisabledMember
        })),
        _count: {
          memberships: circleMembers.length
        }
      }
    })

    console.log('🎯 API Response: Returning', formattedCircles.length, 'circles for user:', user.id)
    return NextResponse.json(formattedCircles)
  } catch (error) {
    console.error('Error fetching circles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 })
    }

    // Create new circle using Drizzle
    console.log('🔍 Drizzle Query: Creating new circle for user:', user.id, 'with name:', name)
    const newCircle = await db
      .insert(circleBadges)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        color,
        icon: icon || 'users',
        creatorId: user.id,
        isDefault: false,
        isDisabled: false,
        isCreatorDisabled: false
      })
      .returning()
    
    console.log('✅ Drizzle Result: New circle created with ID:', newCircle[0]?.id)

    return NextResponse.json(newCircle[0])
  } catch (error) {
    console.error('Error creating circle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}