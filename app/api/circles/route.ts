import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { circleBadges, circleMemberships, profiles } from '@/lib/drizzle/schema'
import { eq, or, and, not } from 'drizzle-orm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('API: Circles request received')

    // Check authentication
    console.log('API: Checking cookies for auth token')
    const cookieStore = cookies()
    console.log('API: Cookie store available')

    const token = cookieStore.get('supabase-auth-token')?.value

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

    // Get circles where user is creator or member using Drizzle
    const userCircles = await db
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
      .where(
        or(
          eq(circleBadges.creatorId, user.id),
          and(
            eq(circleMemberships.userId, user.id),
            eq(circleMemberships.status, 'active')
          )
        )
      )
      .leftJoin(circleMemberships, eq(circleBadges.id, circleMemberships.circleId))
      .orderBy(circleBadges.isDefault, circleBadges.createdAt)

    // Get memberships for each circle
    const circleIds = userCircles.map(circle => circle.id)

    let memberships = []
    if (circleIds.length > 0) {
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
            not(eq(circleMemberships.isDisabledMember, true))
          )
        )
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

    return NextResponse.json(formattedCircles)
  } catch (error) {
    console.error('Error fetching circles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = cookies()
    const token = cookieStore.get('supabase-auth-token')?.value

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

    return NextResponse.json(newCircle[0])
  } catch (error) {
    console.error('Error creating circle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}