import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db, checkDatabaseConnection } from '@/lib/drizzle/client'
import { connections, profiles } from '@/lib/drizzle/schema'
import { eq, or, desc, inArray } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Retry function for database operations with exponential backoff
async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      const isConnectionError = error?.code === 'CONNECT_TIMEOUT' ||
                               error?.message?.includes('timeout') ||
                               error?.message?.includes('connection')

      if (isConnectionError && attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1) // Exponential backoff
        console.warn(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
        continue
      }

      throw error
    }
  }

  throw new Error('Max retries exceeded')
}

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

    // Check database connection health first
    const isDatabaseHealthy = await checkDatabaseConnection()
    if (!isDatabaseHealthy) {
      console.error('❌ Database health check failed')
      return NextResponse.json(
        { error: 'Database temporarily unavailable' },
        { status: 503 }
      )
    }

    // Get all connections first with retry logic
    const queryStartTime = Date.now()

    const connectionResults = await retryDatabaseOperation(async () => {
      return await db
      .select({
          id: connections.id,
          user1Id: connections.user1Id,
          user2Id: connections.user2Id,
          connectionType: connections.connectionType,
          connectedAt: connections.connectedAt,
          // User1 profile data included directly in the join
          user1FirstName: profiles.firstName,
          user1LastName: profiles.lastName,
          user1ProfileImageUrl: profiles.profileImageUrl,
          user1Role: profiles.role,
          user1Bio: profiles.bio,
          user1Location: profiles.location,
          user1LastActiveDate: profiles.lastActiveDate,
          user1AvailabilityStatus: profiles.availabilityStatus,
        })
        .from(connections)
        .leftJoin(profiles, eq(connections.user1Id, profiles.id))
        .where(
          or(
            eq(connections.user1Id, userIdToQuery),
            eq(connections.user2Id, userIdToQuery)
          )
        )
        .orderBy(desc(connections.connectedAt))
    })

    if (connectionResults.length === 0) {
      const queryEndTime = Date.now()
      console.log(`⚡ Query execution time: ${queryEndTime - queryStartTime} ms`)
      console.log(`✅ Drizzle Result: Found 0 connections`)
      return NextResponse.json([])
    }

    // Extract unique user IDs from connections that are not the current user
    const userIdsToFetch = new Set<string>();
    connectionResults.forEach(conn => {
      if (conn.user1Id === userIdToQuery && conn.user2Id !== userIdToQuery) {
        userIdsToFetch.add(conn.user2Id);
      } else if (conn.user2Id === userIdToQuery && conn.user1Id !== userIdToQuery) {
        userIdsToFetch.add(conn.user1Id);
      }
    });

    // Fetch profiles for the other users in a single query with retry logic
    let userProfilesMap = new Map<string, any>();
    if (userIdsToFetch.size > 0) {
      const userProfiles = await retryDatabaseOperation(async () => {
        return await db
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
            inArray(profiles.id, Array.from(userIdsToFetch))
          )
      });

      // Create map for quick lookup
      userProfiles?.forEach((profile) => {
        if (profile && profile.id) {
          userProfilesMap.set(profile.id, profile);
        }
      });
    }


    const queryEndTime = Date.now()
    console.log(`⚡ Query execution time: ${queryEndTime - queryStartTime} ms`)

    // Process results to create final connections array with comprehensive safety checks
    let finalConnections = []
    try {
      if (connectionResults && Array.isArray(connectionResults) && connectionResults.length > 0) {
        console.log(`📋 Processing ${connectionResults.length} connection results`)

        finalConnections = connectionResults
          .map((connection) => {
            // Validate connection object
            if (!connection || typeof connection !== 'object') {
              console.warn(`⚠️ Invalid connection row:`, connection)
              return null
            }

            const isUser1TheQuerier = connection.user1Id === userIdToQuery;
            const otherUserId = isUser1TheQuerier ? connection.user2Id : connection.user1Id;

            // Get the profile for the 'other' user
            let otherUserProfile = null;
            if (isUser1TheQuerier) {
              otherUserProfile = userProfilesMap.get(connection.user2Id);
            } else {
              // For user1, profile data is already joined if it exists
              otherUserProfile = connection.user1Id === connection.user2Id ? null : { // Avoid self-profile if user1Id === user2Id
                  id: connection.user1Id,
                  firstName: connection.user1FirstName,
                  lastName: connection.user1LastName,
                  profileImageUrl: connection.user1ProfileImageUrl,
                  role: connection.user1Role,
                  bio: connection.user1Bio,
                  location: connection.user1Location,
                  lastActiveDate: connection.user1LastActiveDate,
                  availabilityStatus: connection.user1AvailabilityStatus,
              };
            }

            // Create safe user objects with fallbacks
            const createSafeUserObject = (profile, defaultUserId) => {
              if (!profile || typeof profile !== 'object') {
                return {
                  id: defaultUserId || '',
                  firstName: 'Unknown',
                  lastName: 'User',
                  profileImageUrl: null,
                  role: '',
                  bio: null,
                  location: null,
                  lastActiveDate: null,
                  availabilityStatus: null,
                }
              }

              return {
                id: profile.id || defaultUserId || '',
                firstName: profile.firstName || 'Unknown',
                lastName: profile.lastName || 'User',
                profileImageUrl: profile.profileImageUrl || null,
                role: profile.role || '',
                bio: profile.bio || null,
                location: profile.location || null,
                lastActiveDate: profile.lastActiveDate || null,
                availabilityStatus: profile.availabilityStatus || null,
              }
            }

            return {
              id: connection.id,
              user1Id: connection.user1Id,
              user2Id: connection.user2Id,
              connectionType: connection.connectionType || 'friend',
              connectedAt: connection.connectedAt || null,
              user: createSafeUserObject(otherUserProfile, otherUserId)
            }
          })
          .filter(connection => connection !== null) // Remove null entries

        console.log(`✅ Successfully processed ${finalConnections.length} valid connections`)
      } else {
        console.log('📋 No connection results to process')
      }
    } catch (processingError) {
      console.error('❌ Error processing connections:', processingError)
      return NextResponse.json(
        { error: 'Error processing connection data' },
        { status: 500 }
      )
    }

    console.log(`✅ Drizzle Result: Found ${finalConnections.length} connections`)

    // Format connections to show the other user's info with comprehensive safety checks
    let formattedConnections = []
    try {
      if (finalConnections && Array.isArray(finalConnections) && finalConnections.length > 0) {
        console.log(`🎨 Formatting ${finalConnections.length} connections for user: ${userIdToQuery}`)

        formattedConnections = finalConnections
          .map((connection) => {
            // Validate connection object
            if (!connection || typeof connection !== 'object') {
              console.warn(`⚠️ Invalid connection object:`, connection)
              return null
            }

            const otherUser = connection.user; // User object is already prepared

            if (!otherUser || typeof otherUser !== 'object') {
              console.warn(`⚠️ Missing or invalid user data for connection ${connection.id}`)
              return null // Skip this connection if user data is fundamentally missing
            }

            try {
              return {
                id: connection.id,
                connectionType: connection.connectionType || 'friend',
                connectedAt: connection.connectedAt || null,
                user: {
                  id: otherUser.id || 'unknown',
                  firstName: otherUser.firstName || 'Unknown',
                  lastName: otherUser.lastName || 'User',
                  profileImageUrl: otherUser.profileImageUrl || null,
                  role: otherUser.role || '',
                  bio: otherUser.bio || null,
                  location: otherUser.location || null,
                  status: getStatusFromAvailability(otherUser.availabilityStatus, otherUser.lastActiveDate),
                  lastInteraction: formatLastInteraction(otherUser.lastActiveDate)
                }
              }
            } catch (userFormatError) {
              console.error(`❌ Error formatting user data for connection ${connection.id}:`, userFormatError)
              // Return a safe fallback instead of null if formatting fails
              return {
                id: connection.id,
                connectionType: connection.connectionType || 'friend',
                connectedAt: connection.connectedAt || null,
                user: {
                  id: otherUser.id || 'unknown',
                  firstName: 'Unknown',
                  lastName: 'User',
                  profileImageUrl: null,
                  role: '',
                  bio: null,
                  location: null,
                  status: 'offline',
                  lastInteraction: 'Never'
                }
              }
            }
          })
          .filter(connection => connection !== null) // Remove null entries

        console.log(`✅ Successfully formatted ${formattedConnections.length} connections`)
      } else {
        console.log('🎨 No final connections to format')
      }
    } catch (formattingError) {
      console.error('❌ Error formatting connections:', formattingError)
      return NextResponse.json(
        { error: 'Error formatting connection data' },
        { status: 500 }
      )
    }

    const endTime = Date.now()
    console.log(`🎯 API Response: Returning ${formattedConnections.length} connections for user: ${userIdToQuery}`)
    console.log(`⚡ Total API response time: ${endTime - startTime} ms`)

    return NextResponse.json(formattedConnections)

  } catch (error: any) {
    console.error('Error fetching connections:', error)

    // Handle specific error types
    if (error?.code === 'CONNECT_TIMEOUT' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Database connection timeout. Please try again in a few moments.',
          code: 'CONNECTION_TIMEOUT'
        },
        { status: 503 }
      )
    }

    if (error?.message?.includes('connection')) {
      return NextResponse.json(
        {
          error: 'Database temporarily unavailable. Please try again.',
          code: 'CONNECTION_ERROR'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}