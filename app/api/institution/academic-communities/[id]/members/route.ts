
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const communityId = parseInt(params.id)

    // Fetch community members
    const { data: memberships, error } = await supabase
      .from('academic_community_members')
      .select(`
        *,
        profiles!user_id(
          id,
          first_name,
          last_name,
          profile_image_url,
          role
        )
      `)
      .eq('community_id', communityId)

    if (error) {
      console.error('Error fetching community members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    return NextResponse.json({ memberships })
  } catch (error) {
    console.error('Error in GET /api/institution/academic-communities/[id]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const communityId = parseInt(params.id)
    const { member_id } = await request.json()

    if (!member_id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('academic_community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', member_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Institution is already a member' }, { status: 400 })
    }

    // Add member to community
    const { data: membership, error } = await supabase
      .from('academic_community_members')
      .insert({
        community_id: communityId,
        user_id: member_id,
        role: 'member'
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding member:', error)
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({ success: true, membership })
  } catch (error) {
    console.error('Error in POST /api/institution/academic-communities/[id]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
