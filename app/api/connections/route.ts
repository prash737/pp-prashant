import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { connections, profiles } from '@/lib/drizzle/schema'
import { eq, or, desc, inArray } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function getStatusFromAvailability(availabilityStatus: string | null, lastActiveDate: Date | null): string {
  if (!availabilityStatus || !lastActiveDate) return 'offline'

  const now = new Date()
  const lastActive = new Date(lastActiveDate)
  const timeDiff = now.getTime() - lastActive.getTime()
  const minutesDiff = timeDiff / (1000 * 60)

  if (availabilityStatus === 'online' && minutesDiff < 5) return 'online'
  if (availabilityStatus === 'away' || minutesDiff < 30) return 'away'
  return 'offline'
}

function formatLastInteraction(lastActiveDate: Date | null): string {
  if (!lastActiveDate) return 'Never'

  const now = new Date()
  const lastActive = new Date(lastActiveDate)
  const timeDiff = now.getTime() - lastActive.getTime()
  const minutesDiff = Math.floor(timeDiff / (1000 * 60))
  const hoursDiff = Math.floor(minutesDiff / 60)
  const daysDiff = Math.floor(hoursDiff / 24)

  if (minutesDiff < 1) return 'Just now'
  if (minutesDiff < 60) return `${minutesDiff} minutes ago`
  if (hoursDiff < 24) return `${hoursDiff} hours ago`
  if (daysDiff < 30) return `${daysDiff} days ago`
  return lastActive.toLocaleDateString()
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log('🔍 API: Connections request received')

    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    console.log('🔍 API: Checking cookies for auth token')

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

    console.log('🔍 API: Token found, verifying with Supabase')
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ API: Authenticated user found:', user.id)

    // Check if we're fetching connections for a specific user
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    // If no specific user is requested, default to current user
    const userIdToQuery = targetUserId || user.id

    console.log('🔍 Drizzle Query: Fetching connections with optimized single JOIN query')

    // Get all connections first
    const queryStartTime = Date.now()

    const connectionResults = await db
      .select({
        id: connections.id,
        user1Id: connections.user1Id,
        user2Id: connections.user2Id,
        connectionType: connections.connectionType,
        connectedAt: connections.connectedAt,
      })
      .from(connections)
      .where(
        or(
          eq(connections.user1Id, userIdToQuery),
          eq(connections.user2Id, userIdToQuery)
        )
      )
      .orderBy(desc(connections.connectedAt))

    if (connectionResults.length === 0) {
      const queryEndTime = Date.now()
      console.log(`⚡ Query execution time: ${queryEndTime - queryStartTime} ms`)
      console.log(`✅ Drizzle Result: Found 0 connections`)
      return NextResponse.json([])
    }

    // Get unique user IDs from connections
    const allUserIds = new Set()
    connectionResults.forEach(conn => {
      allUserIds.add(conn.user1Id)
      allUserIds.add(conn.user2Id)
    })

    // Fetch all user profiles in a single query
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
        availabilityStatus: profiles.availabilityStatus,
      })
      .from(profiles)
      .where(
        // Use IN operator with array of user IDs
        inArray(profiles.id, Array.from(allUserIds))
      )

    // Create map for quick lookup
    const userProfilesMap = new Map()
    userProfiles.forEach(profile => {
      userProfilesMap.set(profile.id, profile)
    })

    const queryEndTime = Date.now()
    console.log(`⚡ Query execution time: ${queryEndTime - queryStartTime} ms`)

    // Process results to create final connections array
    const finalConnections = connectionResults.map(row => {
      const user1Profile = userProfilesMap.get(row.user1Id)
      const user2Profile = userProfilesMap.get(row.user2Id)

      return {
        id: row.id,
        user1Id: row.user1Id,
        user2Id: row.user2Id,
        connectionType: row.connectionType,
        connectedAt: row.connectedAt,
        user1: user1Profile ? {
          id: user1Profile.id,
          firstName: user1Profile.firstName,
          lastName: user1Profile.lastName,
          profileImageUrl: user1Profile.profileImageUrl,
          role: user1Profile.role,
          bio: user1Profile.bio,
          location: user1Profile.location,
          lastActiveDate: user1Profile.lastActiveDate,
          availabilityStatus: user1Profile.availabilityStatus,
        } : null,
        user2: user2Profile ? {
          id: user2Profile.id,
          firstName: user2Profile.firstName,
          lastName: user2Profile.lastName,
          profileImageUrl: user2Profile.profileImageUrl,
          role: user2Profile.role,
          bio: user2Profile.bio,
          location: user2Profile.location,
          lastActiveDate: user2Profile.lastActiveDate,
          availabilityStatus: user2Profile.availabilityStatus,
        } : null
      }
    })

    console.log(`✅ Drizzle Result: Found ${finalConnections.length} connections`)

    // Format connections to show the other user's info
    const formattedConnections = finalConnections.map(connection => {
      const otherUser = connection.user1Id === userIdToQuery ? connection.user2 : connection.user1

      if (!otherUser) {
        console.warn(`⚠️ Missing user data for connection ${connection.id}`)
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

    const endTime = Date.now()
    console.log(`🎯 API Response: Returning ${formattedConnections.length} connections for user: ${userIdToQuery}`)
    console.log(`⚡ Total API response time: ${endTime - startTime} ms`)

    return NextResponse.json(formattedConnections)

  } catch (error) {
    console.error('Error fetching connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}