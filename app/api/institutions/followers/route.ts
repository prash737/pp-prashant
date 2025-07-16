
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Verify the institution exists
    const institution = await prisma.profile.findUnique({
      where: { 
        id: institutionId,
        role: 'institution'
      },
      select: { 
        id: true,
        firstName: true,
        lastName: true,
        institution: {
          select: {
            institutionName: true
          }
        }
      }
    })

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    // Get followers with their profile information
    const followers = await prisma.institutionFollowConnection.findMany({
      where: {
        receiverId: institutionId
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
        connectedAt: 'desc'
      }
    })

    const followersData = followers.map(follow => ({
      id: follow.sender.id,
      firstName: follow.sender.firstName,
      lastName: follow.sender.lastName,
      profileImageUrl: follow.sender.profileImageUrl,
      role: follow.sender.role,
      bio: follow.sender.bio,
      location: follow.sender.location,
      followedAt: follow.connectedAt
    }))

    return NextResponse.json({ 
      success: true,
      followers: followersData,
      count: followersData.length,
      institutionName: institution.institution?.institutionName || `${institution.firstName} ${institution.lastName}`
    })

  } catch (error) {
    console.error('Error fetching institution followers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
