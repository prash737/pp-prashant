
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { eq, or, and, sql, desc, asc } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('API: Circles request received')
    console.log('API: Checking cookies for auth token')

    const cookieStore = request.cookies
    console.log('API: Cookie store available')

    // Try to get the access token from cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('API: No access token found in cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Token found, verifying with Supabase')
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      console.log('API: Token verification failed:', error?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    // Get user's circle badges with member counts using Drizzle
    const circlesResult = await db.execute(sql`
      SELECT 
        cb.id,
        cb.creator_id,
        cb.name,
        cb.description,
        cb.color,
        cb.icon,
        cb.is_default,
        cb.is_disabled,
        cb.is_creator_disabled,
        cb.created_at,
        cb.updated_at,
        -- Creator info
        p_creator.id as creator_profile_id,
        p_creator.first_name as creator_first_name,
        p_creator.last_name as creator_last_name,
        p_creator.profile_image_url as creator_profile_image_url,
        -- Member count
        COALESCE(member_counts.member_count, 0) as member_count
      FROM circle_badges cb
      LEFT JOIN profiles p_creator ON cb.creator_id = p_creator.id
      LEFT JOIN (
        SELECT 
          circle_id, 
          COUNT(*) as member_count
        FROM circle_memberships 
        WHERE status = 'active' 
        GROUP BY circle_id
      ) member_counts ON cb.id = member_counts.circle_id
      WHERE (
        cb.creator_id = ${user.id} 
        OR EXISTS (
          SELECT 1 
          FROM circle_memberships cm 
          WHERE cm.circle_id = cb.id 
            AND cm.user_id = ${user.id} 
            AND cm.status = 'active'
        )
      )
      ORDER BY cb.is_default DESC, cb.created_at ASC
    `)

    const circles = circlesResult.rows || []

    // Get memberships for each circle
    const circleIds = circles.map(circle => circle.id)
    
    let memberships = []
    if (circleIds.length > 0) {
      const membershipsResult = await db.execute(sql`
        SELECT 
          cm.id,
          cm.circle_id,
          cm.user_id,
          cm.status,
          cm.joined_at,
          cm.is_disabled_member,
          cm.created_at,
          cm.updated_at,
          -- User info
          p.id as user_profile_id,
          p.first_name as user_first_name,
          p.last_name as user_last_name,
          p.profile_image_url as user_profile_image_url,
          p.role as user_role,
          p.bio as user_bio,
          p.availability_status as user_availability_status
        FROM circle_memberships cm
        JOIN profiles p ON cm.user_id = p.id
        WHERE cm.circle_id = ANY(${circleIds}) 
          AND cm.status = 'active'
        ORDER BY cm.joined_at ASC
      `)
      memberships = membershipsResult.rows || []
    }

    // Transform the data to match the original Prisma structure
    const transformedCircles = circles.map(circle => ({
      id: circle.id,
      creatorId: circle.creator_id,
      name: circle.name,
      description: circle.description,
      color: circle.color,
      icon: circle.icon,
      isDefault: circle.is_default,
      isDisabled: circle.is_disabled,
      isCreatorDisabled: circle.is_creator_disabled,
      createdAt: circle.created_at,
      updatedAt: circle.updated_at,
      creator: {
        id: circle.creator_id,
        firstName: circle.creator_first_name,
        lastName: circle.creator_last_name,
        profileImageUrl: circle.creator_profile_image_url
      },
      memberships: memberships
        .filter(membership => membership.circle_id === circle.id)
        .map(membership => ({
          id: membership.id,
          circleId: membership.circle_id,
          userId: membership.user_id,
          status: membership.status,
          joinedAt: membership.joined_at,
          isDisabledMember: membership.is_disabled_member,
          createdAt: membership.created_at,
          updatedAt: membership.updated_at,
          user: {
            id: membership.user_id,
            firstName: membership.user_first_name,
            lastName: membership.user_last_name,
            profileImageUrl: membership.user_profile_image_url,
            role: membership.user_role,
            bio: membership.user_bio,
            availabilityStatus: membership.user_availability_status
          }
        })),
      _count: {
        memberships: parseInt(circle.member_count) || 0
      }
    }))

    return NextResponse.json(transformedCircles)
  } catch (error) {
    console.error('Error fetching circles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Create circle using Drizzle
    const newCircleResult = await db.execute(sql`
      INSERT INTO circle_badges (
        creator_id, 
        name, 
        description, 
        color, 
        icon, 
        is_default,
        created_at,
        updated_at
      )
      VALUES (
        ${user.id},
        ${name.trim()},
        ${description?.trim() || null},
        ${color || '#3B82F6'},
        ${icon || 'users'},
        false,
        NOW(),
        NOW()
      )
      RETURNING id, creator_id, name, description, color, icon, is_default, created_at, updated_at
    `)

    const newCircle = newCircleResult.rows[0]

    // Get creator info
    const creatorResult = await db.execute(sql`
      SELECT id, first_name, last_name, profile_image_url
      FROM profiles 
      WHERE id = ${user.id}
    `)

    const creator = creatorResult.rows[0]

    // Format response to match original Prisma structure
    const circle = {
      id: newCircle.id,
      creatorId: newCircle.creator_id,
      name: newCircle.name,
      description: newCircle.description,
      color: newCircle.color,
      icon: newCircle.icon,
      isDefault: newCircle.is_default,
      createdAt: newCircle.created_at,
      updatedAt: newCircle.updated_at,
      creator: {
        firstName: creator.first_name,
        lastName: creator.last_name,
        profileImageUrl: creator.profile_image_url
      },
      memberships: [],
      _count: {
        memberships: 0
      }
    }

    return NextResponse.json(circle, { status: 201 })
  } catch (error) {
    console.error('Error creating circle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
