import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if we're fetching connections for a specific user
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    // If no specific user is requested, default to current user
    const userIdToQuery = targetUserId || user.id

    // Get connections where user is either user1 or user2
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { user1Id: userIdToQuery },
          { user2Id: userIdToQuery }
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

    // Format connections to show the other user's info
    const formattedConnections = connections.map(connection => {
      const otherUser = connection.user1Id === userIdToQuery ? connection.user2 : connection.user1

      return {
        id: connection.id,
        connectionType: connection.connectionType,
        connectedAt: connection.connectedAt,
        user: {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          profileImageUrl: otherUser.profileImageUrl,
          role: otherUser.role,
          bio: otherUser.bio,
          location: otherUser.location,
          status: getStatusFromAvailability(otherUser.availabilityStatus, otherUser.lastActiveDate),
          lastInteraction: formatLastInteraction(otherUser.lastActiveDate)
        }
      }
    })

    return NextResponse.json(formattedConnections)

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getStatusFromAvailability(availabilityStatus: string, lastActiveDate: Date): 'online' | 'offline' | 'away' {
  if (availabilityStatus === 'online') {
    const now = new Date()
    const lastActive = new Date(lastActiveDate)
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)

    if (diffMinutes < 5) return 'online'
    if (diffMinutes < 30) return 'away'
    return 'offline'
  }

  return 'offline'
}

function formatLastInteraction(lastActiveDate: Date): string {
  const now = new Date()
  const lastActive = new Date(lastActiveDate)
  const diffMs = now.getTime() - lastActive.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`

  return lastActive.toLocaleDateString()
}