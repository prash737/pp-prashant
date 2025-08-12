import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'received' // 'received' or 'sent'

    let connectionRequests

    if (type === 'received') {
      connectionRequests = await prisma.connectionRequest.findMany({
        where: {
          receiverId: user.id
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
          createdAt: 'desc'
        }
      })
    } else if (type === 'sent') {
      connectionRequests = await prisma.connectionRequest.findMany({
        where: {
          senderId: user.id
        },
        include: {
          receiver: {
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
          createdAt: 'desc'
        }
      })
    } else {
      connectionRequests = []
    }

    return NextResponse.json(connectionRequests)

  } catch (error) {
    console.error('Error fetching connection requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}