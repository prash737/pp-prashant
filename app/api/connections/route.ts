
<old_str>import { NextRequest, NextResponse } from 'next/server'
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
}</old_str>
<new_str>import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { connections, profiles } from '@/lib/drizzle/schema'
import { eq, or, desc } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('API: Connections request received')
    
    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    console.log('API: Checking cookies for auth token')
    
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

    console.log('API: Token found, verifying with Supabase')
    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    // Check if we're fetching connections for a specific user
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    // If no specific user is requested, default to current user
    const userIdToQuery = targetUserId || user.id

    console.log('🔍 Drizzle Query: Fetching connections with optimized JOIN')

    // Optimized single query with INNER JOINs to both user profiles
    const queryStartTime = Date.now()
    
    const connectionResults = await db
      .select({
        // Connection data
        id: connections.id,
        user1Id: connections.user1Id,
        user2Id: connections.user2Id,
        connectionType: connections.connectionType,
        connectedAt: connections.connectedAt,
        // User1 profile data
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
      .innerJoin(profiles, eq(connections.user1Id, profiles.id))
      .where(
        or(
          eq(connections.user1Id, userIdToQuery),
          eq(connections.user2Id, userIdToQuery)
        )
      )
      .orderBy(desc(connections.connectedAt))

    // Second query for user2 profiles (only for connections where current user is user1)
    const user2Results = await db
      .select({
        // Connection data
        id: connections.id,
        user1Id: connections.user1Id,
        user2Id: connections.user2Id,
        // User2 profile data
        user2FirstName: profiles.firstName,
        user2LastName: profiles.lastName,
        user2ProfileImageUrl: profiles.profileImageUrl,
        user2Role: profiles.role,
        user2Bio: profiles.bio,
        user2Location: profiles.location,
        user2LastActiveDate: profiles.lastActiveDate,
        user2AvailabilityStatus: profiles.availabilityStatus,
      })
      .from(connections)
      .innerJoin(profiles, eq(connections.user2Id, profiles.id))
      .where(
        or(
          eq(connections.user1Id, userIdToQuery),
          eq(connections.user2Id, userIdToQuery)
        )
      )

    const queryEndTime = Date.now()
    console.log(`⚡ Query execution time: ${queryEndTime - queryStartTime} ms`)

    // Merge results efficiently
    const connectionMap = new Map()
    
    // Process user1 results
    connectionResults.forEach(row => {
      connectionMap.set(row.id, {
        id: row.id,
        user1Id: row.user1Id,
        user2Id: row.user2Id,
        connectionType: row.connectionType,
        connectedAt: row.connectedAt,
        user1: {
          id: row.user1Id,
          firstName: row.user1FirstName,
          lastName: row.user1LastName,
          profileImageUrl: row.user1ProfileImageUrl,
          role: row.user1Role,
          bio: row.user1Bio,
          location: row.user1Location,
          lastActiveDate: row.user1LastActiveDate,
          availabilityStatus: row.user1AvailabilityStatus,
        }
      })
    })

    // Process user2 results
    user2Results.forEach(row => {
      const existing = connectionMap.get(row.id)
      if (existing) {
        existing.user2 = {
          id: row.user2Id,
          firstName: row.user2FirstName,
          lastName: row.user2LastName,
          profileImageUrl: row.user2ProfileImageUrl,
          role: row.user2Role,
          bio: row.user2Bio,
          location: row.user2Location,
          lastActiveDate: row.user2LastActiveDate,
          availabilityStatus: row.user2AvailabilityStatus,
        }
      }
    })

    const finalConnections = Array.from(connectionMap.values())

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
}</old_str>
