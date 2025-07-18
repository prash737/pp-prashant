
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: childId } = await params

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 403 }
      )
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
