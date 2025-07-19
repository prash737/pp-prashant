
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(request: NextRequest) {
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

    const { institutionId } = await request.json()

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Delete the follow connection
    await prisma.institutionFollowConnection.deleteMany({
      where: {
        senderId: authData.user.id,
        receiverId: institutionId
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Institution unfollowed successfully'
    })

  } catch (error) {
    console.error('Error unfollowing institution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { institutionId } = await request.json()

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Verify the institution exists and has role 'institution'
    const institution = await prisma.profile.findUnique({
      where: { id: institutionId },
      select: { role: true }
    })

    if (!institution || institution.role !== 'institution') {
      return NextResponse.json({ error: 'Invalid institution' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.institutionFollowConnection.findUnique({
      where: {
        senderId_receiverId: {
          senderId: authData.user.id,
          receiverId: institutionId
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this institution' }, { status: 400 })
    }

    // Create follow connection
    await prisma.institutionFollowConnection.create({
      data: {
        senderId: authData.user.id,
        receiverId: institutionId
      }
    })

    return NextResponse.json({ success: true, following: true })

  } catch (error) {
    console.error('Error following institution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const { institutionId } = await request.json()

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Delete follow connection
    const deleted = await prisma.institutionFollowConnection.deleteMany({
      where: {
        senderId: authData.user.id,
        receiverId: institutionId
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Follow relationship not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, following: false })

  } catch (error) {
    console.error('Error unfollowing institution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
