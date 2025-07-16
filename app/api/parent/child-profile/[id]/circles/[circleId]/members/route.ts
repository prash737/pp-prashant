
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; circleId: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id
    const circleId = resolvedParams.circleId
    
    console.log('🔍 Parent requesting circle members for child:', childId, 'circle:', circleId)

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    console.log('🔍 Auth cookies:', { parentId: !!parentId, parentSession: !!parentSession })

    if (!parentId || !parentSession) {
      console.log('❌ No parent session found')
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      console.log('❌ Child not found or not authorized')
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    // Get circle information
    const circle = await prisma.circleBadge.findUnique({
      where: { id: circleId },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        creatorId: true
      }
    })

    if (!circle) {
      console.log('❌ Circle not found')
      return NextResponse.json(
        { success: false, error: 'Circle not found' },
        { status: 404 }
      )
    }

    // Check if child has access to this circle (either creator or member)
    const hasAccess = circle.creatorId === childId || await prisma.circleMembership.findFirst({
      where: {
        circleId: circleId,
        userId: childId,
        status: 'active'
      }
    })

    if (!hasAccess) {
      console.log('❌ Child does not have access to this circle')
      return NextResponse.json(
        { success: false, error: 'Child does not have access to this circle' },
        { status: 403 }
      )
    }

    // Get all active members of the circle
    const memberships = await prisma.circleMembership.findMany({
      where: {
        circleId: circleId,
        status: 'active'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      }
    })

    // Get circle creator info
    const creator = await prisma.profile.findUnique({
      where: { id: circle.creatorId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImageUrl: true,
        role: true
      }
    })

    // Combine creator and members
    const allMembers = []
    
    // Add creator first
    if (creator) {
      allMembers.push({
        id: creator.id,
        firstName: creator.firstName,
        lastName: creator.lastName,
        profileImageUrl: creator.profileImageUrl,
        role: creator.role,
        isCreator: true
      })
    }

    // Add other members
    memberships.forEach(membership => {
      if (membership.user.id !== circle.creatorId) {
        allMembers.push({
          id: membership.user.id,
          firstName: membership.user.firstName,
          lastName: membership.user.lastName,
          profileImageUrl: membership.user.profileImageUrl,
          role: membership.user.role,
          isCreator: false
        })
      }
    })

    console.log('✅ Circle members fetched successfully:', allMembers.length)

    return NextResponse.json({
      success: true,
      circle: {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        color: circle.color,
        icon: circle.icon
      },
      members: allMembers
    })

  } catch (error) {
    console.error('Error fetching circle members:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
