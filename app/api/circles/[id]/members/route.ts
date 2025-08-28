
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: circleId } = await params

    // Fetch circle with all members
    const circle = await prisma.circleBadge.findUnique({
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
            status: 'accepted'
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

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      )
    }

    // Combine creator and members
    const members = []

    // Add creator first
    if (circle.creator) {
      members.push({
        user: {
          ...circle.creator,
          role: 'creator'
        },
        isCreator: true,
        joinedAt: circle.createdAt
      })
    }

    // Add other members
    circle.memberships.forEach(membership => {
      members.push({
        user: membership.user,
        isCreator: false,
        joinedAt: membership.joinedAt
      })
    })

    const responseData = {
      success: true,
      circle: {
        id: circle.id,
        name: circle.name,
        description: circle.description,
        color: circle.color,
        icon: circle.icon
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
