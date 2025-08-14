import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db/drizzle'
import { circleBadges, circleMemberships, profiles } from '@/lib/db/schema'
import { eq, or, desc, asc, count, and } from 'drizzle-orm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id

    // Get circles with member counts
    const circles = await db
      .select({
        id: circleBadges.id,
        creatorId: circleBadges.creatorId,
        name: circleBadges.name,
        description: circleBadges.description,
        color: circleBadges.color,
        icon: circleBadges.icon,
        isDefault: circleBadges.isDefault,
        isDisabled: circleBadges.isDisabled,
        isCreatorDisabled: circleBadges.isCreatorDisabled,
        createdAt: circleBadges.createdAt,
        updatedAt: circleBadges.updatedAt,
        memberCount: count(circleMemberships.id)
      })
      .from(circleBadges)
      .leftJoin(
        circleMemberships,
        and(
          eq(circleBadges.id, circleMemberships.circleId),
          eq(circleMemberships.status, 'accepted')
        )
      )
      .where(
        or(
          eq(circleBadges.creatorId, userId),
          eq(circleMemberships.userId, userId)
        )
      )
      .groupBy(circleBadges.id)
      .orderBy(desc(circleBadges.isDefault), asc(circleBadges.createdAt))

    // Get memberships for each circle
    const circleIds = circles.map(c => c.id)

    const memberships = await db
      .select({
        circleId: circleMemberships.circleId,
        userId: circleMemberships.userId,
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profileImageUrl: profiles.profileImageUrl,
        role: profiles.role,
        bio: profiles.bio,
        availabilityStatus: profiles.availabilityStatus
      })
      .from(circleMemberships)
      .innerJoin(profiles, eq(circleMemberships.userId, profiles.id))
      .where(
        and(
          eq(circleMemberships.status, 'accepted')
        )
      )

    // Group memberships by circle
    const membershipMap = new Map()
    memberships.forEach(membership => {
      if (!membershipMap.has(membership.circleId)) {
        membershipMap.set(membership.circleId, [])
      }
      membershipMap.get(membership.circleId).push({
        user: {
          id: membership.id,
          firstName: membership.firstName,
          lastName: membership.lastName,
          profileImageUrl: membership.profileImageUrl,
          role: membership.role,
          bio: membership.bio,
          availabilityStatus: membership.availabilityStatus
        }
      })
    })

    // Format response
    const formattedCircles = circles.map(circle => ({
      ...circle,
      _count: {
        memberships: circle.memberCount
      },
      memberships: membershipMap.get(circle.id) || []
    }))

    return NextResponse.json({ circles: formattedCircles })
  } catch (error) {
    console.error('Error fetching circles:', error)
    return NextResponse.json({ error: 'Failed to fetch circles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API: Create circle request received')

    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('API: No access token found in cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      console.log('API: Token verification failed:', error?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Circle name is required' }, { status: 400 })
    }

    if (name.trim().length > 50) {
      return NextResponse.json({ error: 'Circle name too long' }, { status: 400 })
    }

    const circle = await db.insert(circleBadges).values({
      creatorId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#3B82F6',
      icon: icon || 'users',
      isDefault: false
    }).returning()

    return NextResponse.json(circle[0], { status: 201 })
  } catch (error) {
    console.error('Error creating circle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}