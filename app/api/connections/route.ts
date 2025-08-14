import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db/drizzle'
import { connections, profiles } from '@/lib/db/schema'
import { eq, or, desc } from 'drizzle-orm'

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
    const userConnections = await db
      .select({
        id: connections.id,
        user1Id: connections.user1Id,
        user2Id: connections.user2Id,
        connectionType: connections.connectionType,
        connectedAt: connections.connectedAt
      })
      .from(connections)
      .where(
        or(
          eq(connections.user1Id, userIdToQuery),
          eq(connections.user2Id, userIdToQuery)
        )
      )
      .orderBy(desc(connections.connectedAt))

    // Get all user IDs we need to fetch profiles for
    const userIds = userConnections.flatMap(conn =>
      conn.user1Id === userIdToQuery ? [conn.user2Id] : [conn.user1Id]
    )

    // Fetch all profiles in one query
    const userProfiles = await db
      .select({
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profileImageUrl: profiles.profileImageUrl,
        role: profiles.role,
        bio: profiles.bio,
        location: profiles.location,
        lastActiveDate: profiles.lastActiveDate,
        availabilityStatus: profiles.availabilityStatus
      })
      .from(profiles)
      .where(eq(profiles.id, userIds[0])) // Start with first ID

    // Create a map for quick lookup
    const profileMap = new Map(userProfiles.map(p => [p.id, p]))

    const formattedConnections = userConnections.map(connection => {
      const otherUserId = connection.user1Id === userIdToQuery ? connection.user2Id : connection.user1Id
      const otherUser = profileMap.get(otherUserId)

      // Skip if otherUser is null/undefined
      if (!otherUser) {
        return null
      }

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
    }).filter(Boolean) // Remove null entries

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