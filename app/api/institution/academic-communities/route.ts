import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
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

    // Get institution profile - using institution_profiles table
    const { data: institution } = await supabase
      .from('institution_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    // Fetch academic communities created by this institution
    const { data: communities, error } = await supabase
      .from('academic_communities')
      .select(`
        *,
        academic_community_members(count)
      `)
      .eq('institution_id', institution.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching communities:', error)
      return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 })
    }

    return NextResponse.json({ communities })
  } catch (error) {
    console.error('Error in GET /api/institution/academic-communities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Get institution profile - using institution_profiles table
    const { data: institution } = await supabase
      .from('institution_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    const { name, description, iconUrl } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create new academic community
    const { data: community, error } = await supabase
      .from('academic_communities')
      .insert({
        name,
        description: description || '',
        icon_url: iconUrl || '',
        institution_id: institution.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating community:', error)
      return NextResponse.json({ error: 'Failed to create community' }, { status: 500 })
    }

    // Auto-add the creator institution as a member (admin role)
    const { error: memberError } = await supabase
      .from('academic_community_members')
      .insert({
        community_id: community.id,
        user_id: institution.id,
        role: 'admin'
      })

    if (memberError) {
      console.error('Error adding creator as member:', memberError)
      // Don't fail the creation, just log the error
    }

    return NextResponse.json({ success: true, community })
  } catch (error) {
    console.error('Error in POST /api/institution/academic-communities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}