import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { connections, profiles } from '@/lib/drizzle/schema'
import { eq, or, desc, inArray } from 'drizzle-orm'
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
    const userConnections = await db
      .select()
      .from(connections)
      .where(
        or(
          eq(connections.user1Id, userIdToQuery),
          eq(connections.user2Id, userIdToQuery)
        )
      )
      .orderBy(desc(connections.connectedAt))

    // Get all unique user IDs from connections
    const userIds = new Set<string>()
    userConnections.forEach(conn => {
      userIds.add(conn.user1Id)
      userIds.add(conn.user2Id)
    })

    // Fetch all user profiles in one query
    const userProfiles = await db
      .select({
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        profileImageUrl: profiles.profileImageUrl,
        role: profiles.role,
        bio: profiles.bio,
        location: profiles.location,
        lastActiveDate: profiles.updatedAt,
        availabilityStatus: profiles.availabilityStatus
      })
      .from(profiles)
      .where(
        or(...Array.from(userIds).map(id => eq(profiles.id, id)))
      )

    // Create a map of user profiles for easy lookup
    const userProfileMap = new Map(userProfiles.map(p => [p.id, p]))

    // Format connections to show the other user's info
    const formattedConnections = userConnections.map(conn => {
      // Get the other user's profile
      const otherUserId = conn.user1Id === userIdToQuery ? conn.user2Id : conn.user1Id
      const otherUser = userProfileMap.get(otherUserId)

      if (!otherUser) {
        return null // Skip if user profile not found
      }

      return {
        id: conn.id,
        connectionType: conn.connectionType,
        connectedAt: conn.connectedAt,
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

function getStatusFromAvailability(availabilityStatus: string | null, lastActiveDate: Date | null): 'online' | 'offline' | 'away' {
  if (availabilityStatus === 'online' && lastActiveDate) {
    const now = new Date()
    const lastActive = new Date(lastActiveDate)
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)

    if (diffMinutes < 5) return 'online'
    if (diffMinutes < 30) return 'away'
    return 'offline'
  }

  return 'offline'
}

function formatLastInteraction(lastActiveDate: Date | null): string {
  if (!lastActiveDate) return 'Never'

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