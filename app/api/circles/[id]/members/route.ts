
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: circleId } = await params
    
    // Get current user ID from request headers or cookies
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    
    let currentUserId: string | null = null
    
    // Try to extract user ID from auth token or cookies
    if (cookieHeader?.includes('sb-access-token')) {
      // Extract and verify token to get user ID
      // This is a simplified approach - you might need to decode the JWT
      const tokenMatch = cookieHeader.match(/sb-access-token=([^;]+)/)
      if (tokenMatch) {
        try {
          // You might need to decode JWT here to get user ID
          // For now, let's try to get it from another cookie or header
          const userIdMatch = cookieHeader.match(/user-id=([^;]+)/)
          if (userIdMatch) {
            currentUserId = decodeURIComponent(userIdMatch[1])
          }
        } catch (e) {
          console.log('Could not extract user ID from token')
        }
      }
    }

    // If we still don't have user ID, try from a custom header
    if (!currentUserId) {
      currentUserId = request.headers.get('x-user-id')
    }

    // First, fetch the circle to check disable conditions
    const circle = await prisma.circleBadge.findUnique({
      where: { id: circleId },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        creatorId: true,
        isDisabled: true,
        isCreatorDisabled: true,
        createdAt: true
      }
    })

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      )
    }

    // Check if current user is the creator
    const isCreator = currentUserId && circle.creatorId === currentUserId

    // 1. Check if circle is disabled for all members
    if (circle.isDisabled === true) {
      return NextResponse.json({
        success: false,
        message: 'This circle is disabled for all',
        circle: {
          id: circle.id,
          name: circle.name,
          description: circle.description,
          color: circle.color,
          icon: circle.icon
        },
        members: []
      })
    }

    // 2. Check if creator is disabled and current user is the creator
    if (circle.isCreatorDisabled === true && isCreator) {
      return NextResponse.json({
        success: false,
        message: 'Circle disabled for you',
        circle: {
          id: circle.id,
          name: circle.name,
          description: circle.description,
          color: circle.color,
          icon: circle.icon
        },
        members: []
      })
    }

    // 3. Check if current user is a member and is disabled
    if (currentUserId && !isCreator) {
      const userMembership = await prisma.circleMembership.findFirst({
        where: {
          circleId: circleId,
          userId: currentUserId
        },
        select: {
          is_disabled_member: true
        }
      })

      if (userMembership?.is_disabled_member === true) {
        return NextResponse.json({
          success: false,
          message: 'Circle is disabled for you',
          circle: {
            id: circle.id,
            name: circle.name,
            description: circle.description,
            color: circle.color,
            icon: circle.icon
          },
          members: []
        })
      }
    }

    // If all checks pass, fetch and return members
    const circleWithMembers = await prisma.circleBadge.findUnique({
      where: { id: circleId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            bio: true,
            role: true
          }
        },
        memberships: {
          where: {
            status: 'active',
            OR: [
              { is_disabled_member: false },
              { is_disabled_member: null }
            ]
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                bio: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!circleWithMembers) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      )
    }

    // Combine creator and members
    const members = []

    // Add creator first
    if (circleWithMembers.creator) {
      members.push({
        user: {
          ...circleWithMembers.creator,
          role: 'creator'
        },
        isCreator: true,
        joinedAt: circleWithMembers.createdAt
      })
    }

    // Add other members
    circleWithMembers.memberships.forEach(membership => {
      members.push({
        user: membership.user,
        isCreator: false,
        joinedAt: membership.joinedAt
      })
    })

    const responseData = {
      success: true,
      circle: {
        id: circleWithMembers.id,
        name: circleWithMembers.name,
        description: circleWithMembers.description,
        color: circleWithMembers.color,
        icon: circleWithMembers.icon
      },
      members
    };

    console.log('🎯 Circle Members API Response:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Error fetching circle members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch circle members' },
      { status: 500 }
    )
  }
}
