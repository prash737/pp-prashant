import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    const communityId = parseInt(resolvedParams.id)

    // First get the community creator info
    const { data: community, error: communityError } = await supabase
      .from('academic_communities')
      .select('creator_id')
      .eq('id', communityId)
      .single()

    if (communityError) {
      console.error('Error fetching community info:', communityError)
      return NextResponse.json({ error: 'Failed to fetch community info' }, { status: 500 })
    }

    // Fetch community members
    const { data: memberships, error } = await supabase
      .from('academic_communities_memberships')
      .select(`
        id,
        community_id,
        member_id,
        created_at,
        institution_profiles!inner (
          id,
          institution_name,
          logo_url,
          institution_type,
          verified
        )
      `)
      .eq('community_id', communityId)

    if (error) {
      console.error('Error fetching community members:', error)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    // Add creator flag to memberships
    const enrichedMemberships = (memberships || []).map(membership => ({
      ...membership,
      isCreator: membership.member_id === community.creator_id
    }))

    return NextResponse.json({ memberships: enrichedMemberships })
  } catch (error) {
    console.error('Error in GET /api/institution/academic-communities/[id]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params
    const communityId = parseInt(resolvedParams.id)
    const { member_id } = await request.json()

    if (!member_id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('academic_communities_memberships')
      .select('id')
      .eq('community_id', communityId)
      .eq('member_id', member_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Institution is already a member' }, { status: 400 })
    }

    // Add member to community
    const { data: membership, error } = await supabase
      .from('academic_communities_memberships')
      .insert({
        community_id: communityId,
        member_id: member_id
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