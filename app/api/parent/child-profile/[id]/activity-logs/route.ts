
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: childId } = await params
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

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

    if (!parentId || !parentSession) {
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
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
    }

    // Calculate the date filter
    const dateFilter = new Date()
    dateFilter.setDate(dateFilter.getDate() - days)

    // Fetch connection requests sent by child
    const sentConnectionRequests = await prisma.connectionRequest.findMany({
      where: {
        senderId: childId,
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch connection requests received by child
    const receivedConnectionRequests = await prisma.connectionRequest.findMany({
      where: {
        receiverId: childId,
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch circle invitations sent by child
    const sentCircleInvitations = await prisma.circleInvitation.findMany({
      where: {
        inviterId: childId,
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        invitee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        },
        circle: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Fetch circle invitations received by child
    const receivedCircleInvitations = await prisma.circleInvitation.findMany({
      where: {
        inviteeId: childId,
        createdAt: {
          gte: dateFilter
        }
      },
      include: {
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        },
        circle: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        connectionRequests: {
          sent: sentConnectionRequests,
          received: receivedConnectionRequests
        },
        circleInvitations: {
          sent: sentCircleInvitations,
          received: receivedCircleInvitations
        }
      }
    })

  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
