import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedAuthUser } from '@/lib/services/auth-cache-service'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Connections request received')

    // Use cached auth
    const { user, error: authError } = await getCachedAuthUser(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    // Get user's connections with optimized query
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: user.id },
          { user2Id: user.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
            bio: true,
            location: true,
            lastActiveDate: true,
            availabilityStatus: true
          }
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
            bio: true,
            location: true,
            lastActiveDate: true,
            availabilityStatus: true
          }
        }
      },
      orderBy: {
        connectedAt: 'desc'
      }
    })

    // Format connections to show the other user
    const formattedConnections = connections.map(connection => {
      const otherUser = connection.user1Id === user.id ? connection.user2 : connection.user1
      return {
        id: connection.id,
        connectedAt: connection.connectedAt,
        connectionType: connection.connectionType,
        user: otherUser
      }
    })

    // Count connections by role
    const connectionCounts = formattedConnections.reduce((acc, conn) => {
      acc[conn.user.role] = (acc[conn.user.role] || 0) + 1
      acc.total = (acc.total || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      connections: formattedConnections,
      counts: connectionCounts,
      total: connectionCounts.total || 0
    })

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}