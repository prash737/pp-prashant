
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received'
    const circleId = searchParams.get('circleId')

    let invitations
    if (type === 'sent') {
      const whereClause: any = {
        inviterId: user.id
      }
      
      if (circleId) {
        whereClause.circleId = circleId
      }
      
      invitations = await prisma.circleInvitation.findMany({
        where: whereClause,
        include: {
          circle: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          },
          invitee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      invitations = await prisma.circleInvitation.findMany({
        where: {
          inviteeId: user.id
        },
        include: {
          circle: {
            select: {
              id: true,
              name: true,
              color: true,
              icon: true
            }
          },
          inviter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching circle invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { circleId, inviteeId, message } = body

    if (!circleId || !inviteeId) {
      return NextResponse.json({ error: 'Circle ID and invitee ID are required' }, { status: 400 })
    }

    // Check if circle exists and user is the creator
    const circle = await prisma.circleBadge.findFirst({
      where: {
        id: circleId,
        creatorId: user.id
      }
    })

    if (!circle) {
      return NextResponse.json({ error: 'Circle not found or unauthorized' }, { status: 404 })
    }

    // Check if invitee exists and is connected
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: inviteeId },
          { user1Id: inviteeId, user2Id: user.id }
        ]
      }
    })

    if (!connection) {
      return NextResponse.json({ error: 'Can only invite connections' }, { status: 400 })
    }

    // Check if already invited or member
    const existingInvitation = await prisma.circleInvitation.findFirst({
      where: {
        circleId,
        inviteeId,
        status: { in: ['pending', 'accepted'] }
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Already invited or member' }, { status: 400 })
    }

    const invitation = await prisma.circleInvitation.create({
      data: {
        circleId,
        inviterId: user.id,
        inviteeId,
        message: message?.trim() || null
      },
      include: {
        circle: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true
          }
        },
        invitee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    console.error('Error creating circle invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
