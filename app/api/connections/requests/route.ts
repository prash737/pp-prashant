import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedAuthUser } from '@/lib/services/auth-cache-service'

export async function GET(request: NextRequest) {
  try {
    // Use cached auth
    const { user, error: authError } = await getCachedAuthUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // 'received' or 'sent'

    let connectionRequests

    if (type === 'received') {
      connectionRequests = await prisma.connectionRequest.findMany({
        where: {
          receiverId: user.id
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              role: true,
              bio: true,
              location: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (type === 'sent') {
      connectionRequests = await prisma.connectionRequest.findMany({
        where: {
          senderId: user.id
        },
        include: {
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              role: true,
              bio: true,
              location: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      connectionRequests = []
    }

    return NextResponse.json(connectionRequests)

  } catch (error) {
    console.error('Error fetching connection requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}