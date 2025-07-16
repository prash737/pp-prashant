
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
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

    const { receiverId, message } = await request.json()

    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 })
    }

    if (receiverId === user.id) {
      return NextResponse.json({ error: 'Cannot send connection request to yourself' }, { status: 400 })
    }

    // Check if receiver exists
    const receiver = await prisma.profile.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if connection request already exists
    const existingRequest = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: receiverId },
          { senderId: receiverId, receiverId: user.id }
        ]
      }
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'Connection request already exists' }, { status: 400 })
    }

    // Check if they are already connected
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { user1Id: user.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: user.id }
        ]
      }
    })

    if (existingConnection) {
      return NextResponse.json({ error: 'Already connected' }, { status: 400 })
    }

    // Create connection request
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        senderId: user.id,
        receiverId: receiverId,
        message: message || null,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        },
        receiver: {
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

    return NextResponse.json(connectionRequest)

  } catch (error) {
    console.error('Error creating connection request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
