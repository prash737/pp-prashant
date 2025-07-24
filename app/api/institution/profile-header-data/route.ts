
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching profile header data for institution:', user.id)

    // Fetch all data in parallel
    const [
      quickFactsResult,
      contactInfoResult,
      eventsResult,
      followersResult,
      academicCommunitiesResult
    ] = await Promise.all([
      // Quick facts
      prisma.$queryRaw`
        SELECT * FROM institution_quick_facts WHERE institution_id = ${user.id}::uuid
      `,
      
      // Contact info
      prisma.$queryRaw`
        SELECT * FROM institution_contact_info WHERE institution_id = ${user.id}::uuid
      `,
      
      // Recent events (limit to 5 for header)
      prisma.institutionEvents.findMany({
        where: { institutionId: user.id },
        orderBy: { startDate: 'desc' },
        take: 5
      }),
      
      // Followers count
      prisma.institutionFollowConnections.count({
        where: { receiverId: user.id }
      }),
      
      // Academic communities
      prisma.academicCommunities.findMany({
        where: { institutionId: user.id },
        include: {
          academic_communities_memberships: {
            select: {
              _count: {
                select: { id: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ])

    console.log('Profile header events found:', eventsResult.length)
    console.log('Events data:', eventsResult)

    const profileHeaderData = {
      quickFacts: Array.isArray(quickFactsResult) && quickFactsResult.length > 0 ? quickFactsResult[0] : null,
      contactInfo: Array.isArray(contactInfoResult) && contactInfoResult.length > 0 ? contactInfoResult[0] : null,
      events: eventsResult || [],
      followersCount: followersResult || 0,
      academicCommunities: academicCommunitiesResult || []
    }

    return NextResponse.json({ 
      success: true,
      data: profileHeaderData
    })
  } catch (error) {
    console.error('Error fetching profile header data:', error)
    return NextResponse.json({ error: 'Failed to fetch profile header data' }, { status: 500 })
  }
}
