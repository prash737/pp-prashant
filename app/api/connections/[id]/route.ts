
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get all cookies from the request
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 })
    }

    // Verify the token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid token or user not found' }, { status: 401 })
    }

    console.log('Authenticated user ID:', user.id)

    // Await the params to get the connection ID
    const { id: connectionId } = await params

    console.log('Looking for connection ID:', connectionId)
    console.log('Current user ID:', user.id)

    // Find the connection first to ensure user is authorized to delete it
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId }
    })

    if (!connection) {
      console.log('Connection not found with ID:', connectionId)
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
    }

    console.log('Found connection:', {
      id: connection.id,
      user1Id: connection.user1Id,
      user2Id: connection.user2Id,
      currentUserId: user.id
    })

    // Check if the current user is part of this connection
    if (connection.user1Id !== user.id && connection.user2Id !== user.id) {
      console.log('Authorization failed - user not part of connection')
      return NextResponse.json({ 
        error: 'Unauthorized to delete this connection',
        debug: {
          connectionUser1: connection.user1Id,
          connectionUser2: connection.user2Id,
          currentUser: user.id
        }
      }, { status: 403 })
    }

    console.log('User authorized to delete connection')

    // Delete the connection
    await prisma.connection.delete({
      where: { id: connectionId }
    })

    return NextResponse.json({ message: 'Connection removed successfully' })

  } catch (error) {
    console.error('Error removing connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
