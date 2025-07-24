
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

    // Get institution profile
    const { data: institution } = await supabase
      .from('institution_profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    // Fetch academic communities created by this institution
    const { data: communities, error } = await supabase
      .from('academic_communities')
      .select(`
        *,
        academic_communities_memberships(count)
      `)
      .eq('creator_id', institution.id)
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

    // Get institution profile
    const { data: institution } = await supabase
      .from('institution_profiles')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    const { name, description, image_url } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Create new academic community
    const { data: community, error } = await supabase
      .from('academic_communities')
      .insert({
        name,
        description: description || '',
        image_url: image_url || '',
        creator_id: institution.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating community:', error)
      return NextResponse.json({ error: 'Failed to create community' }, { status: 500 })
    }

    return NextResponse.json({ success: true, community })
  } catch (error) {
    console.error('Error in POST /api/institution/academic-communities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
