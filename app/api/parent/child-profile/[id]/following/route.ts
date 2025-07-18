
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const childId = params.id

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

    // Verify the user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the authenticated user is the parent of the child
    const parentProfile = await prisma.profile.findUnique({
      where: { id: authData.user.id },
      select: { role: true }
    })

    if (!parentProfile || parentProfile.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized - Parent access required' }, { status: 403 })
    }

    // Verify the child belongs to this parent
    const childProfile = await prisma.studentProfile.findUnique({
      where: { id: childId },
      include: {
        profile: {
          select: { parentId: true }
        }
      }
    })

    if (!childProfile || childProfile.profile.parentId !== authData.user.id) {
      return NextResponse.json({ error: 'Child not found or access denied' }, { status: 403 })
    }

    // Fetch the institutions the child is following
    const followingConnections = await prisma.institutionFollowConnection.findMany({
      where: {
        senderId: childId
      },
      include: {
        receiver: {
          include: {
            institution: {
              include: {
                institutionTypeRef: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        connectedAt: 'desc'
      }
    })

    // Format the response
    const followingInstitutions = followingConnections.map(connection => {
      const profile = connection.receiver
      const institution = profile.institution

      return {
        id: profile.id,
        institutionName: institution?.institutionName || `${profile.firstName} ${profile.lastName}`,
        institutionType: institution?.institutionTypeRef?.name || institution?.institutionType || 'Institution',
        institutionCategory: institution?.institutionTypeRef?.category?.name || 'Education',
        website: institution?.website,
        logoUrl: institution?.logoUrl,
        coverImageUrl: institution?.coverImageUrl,
        verified: institution?.verified || false,
        bio: profile.bio,
        location: profile.location,
        followedAt: connection.connectedAt ? new Date(connection.connectedAt).toISOString() : new Date().toISOString()
      }
    })

    return NextResponse.json({ 
      success: true,
      following: followingInstitutions,
      count: followingInstitutions.length
    })

  } catch (error) {
    console.error('Error fetching child following institutions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
