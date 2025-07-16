
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const requestId = resolvedParams.id

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

    const { action } = await request.json() // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Find the connection request
    const connectionRequest = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true
      }
    })

    if (!connectionRequest) {
      return NextResponse.json({ error: 'Connection request not found' }, { status: 404 })
    }

    // Verify that the current user is the receiver
    if (connectionRequest.receiverId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to respond to this request' }, { status: 403 })
    }

    // Update the request status
    const updatedRequest = await prisma.connectionRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'accept' ? 'accepted' : 'declined',
        updatedAt: new Date()
      }
    })

    // If accepted, create a connection
    if (action === 'accept') {
      // Check if connection already exists to avoid duplicates
      const existingConnection = await prisma.connection.findFirst({
        where: {
          OR: [
            {
              user1Id: connectionRequest.senderId,
              user2Id: connectionRequest.receiverId
            },
            {
              user1Id: connectionRequest.receiverId,
              user2Id: connectionRequest.senderId
            }
          ]
        }
      })

      if (!existingConnection) {
        // Ensure user1Id is always the "smaller" UUID to maintain consistency
        const user1Id = connectionRequest.senderId < connectionRequest.receiverId 
          ? connectionRequest.senderId 
          : connectionRequest.receiverId
        const user2Id = connectionRequest.senderId < connectionRequest.receiverId 
          ? connectionRequest.receiverId 
          : connectionRequest.senderId

        await prisma.connection.create({
          data: {
            user1Id,
            user2Id,
            connectionType: 'friend' // Default connection type
          }
        })
      }
    }

    return NextResponse.json(updatedRequest)

  } catch (error) {
    console.error('Error updating connection request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
