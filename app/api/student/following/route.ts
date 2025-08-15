import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // No authentication check - open access

    // Get studentId from query params since no auth
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    
    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    // Get all institutions the student is following
    const followingConnections = await prisma.institutionFollowConnection.findMany({
      where: {
        senderId: studentId
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
    console.error('Error fetching following institutions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}