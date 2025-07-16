import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { action } = body

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Await params before using
    const { id } = await params

    // Find the invitation
    const invitation = await prisma.circleInvitation.findFirst({
      where: {
        id: id,
        inviteeId: user.id,
        status: 'pending'
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (action === 'accept') {
      // Create membership and update invitation in transaction
      await prisma.$transaction([
        prisma.circleMembership.create({
          data: {
            circleId: invitation.circleId,
            userId: user.id,
            status: 'active'
          }
        }),
        prisma.circleInvitation.update({
          where: { id: id },
          data: { status: 'accepted' }
        })
      ])
    } else {
      // Decline invitation
      await prisma.circleInvitation.update({
        where: { id: id },
        data: { status: 'declined' }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error responding to circle invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}