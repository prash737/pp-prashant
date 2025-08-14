import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db/drizzle'
import { institutionFollowConnections, profiles } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get following institutions with profile data in optimized query
    const following = await db
      .select({
        id: institutionFollowConnections.id,
        senderId: institutionFollowConnections.senderId,
        receiverId: institutionFollowConnections.receiverId,
        connectedAt: institutionFollowConnections.connectedAt,
        receiver: {
          id: profiles.id,
          firstName: profiles.firstName,
          lastName: profiles.lastName,
          profileImageUrl: profiles.profileImageUrl,
          bio: profiles.bio,
          location: profiles.location
        }
      })
      .from(institutionFollowConnections)
      .innerJoin(profiles, eq(institutionFollowConnections.receiverId, profiles.id))
      .where(eq(institutionFollowConnections.senderId, userId))
      .orderBy(desc(institutionFollowConnections.connectedAt))

    return NextResponse.json({ following })
  } catch (error) {
    console.error('Error fetching following institutions:', error)
    return NextResponse.json({ error: 'Failed to fetch following institutions' }, { status: 500 })
  }
}