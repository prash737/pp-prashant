
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
    const institutionIds = searchParams.get('ids')?.split(',') || []

    if (institutionIds.length === 0) {
      return NextResponse.json({ followStatus: {} })
    }

    // Get follow status for multiple institutions
    const followConnections = await prisma.institutionFollowConnection.findMany({
      where: {
        senderId: authData.user.id,
        receiverId: {
          in: institutionIds
        }
      },
      select: {
        receiverId: true
      }
    })

    const followStatus = institutionIds.reduce((acc, id) => {
      acc[id] = followConnections.some(conn => conn.receiverId === id)
      return acc
    }, {} as Record<string, boolean>)

    return NextResponse.json({ followStatus })

  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
