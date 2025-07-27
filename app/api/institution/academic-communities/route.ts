import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

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

    // Verify institution exists in profiles table
    const institution = await prisma.profile.findFirst({
      where: { 
        id: user.id,
        role: 'institution'
      }
    })

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

    // Verify institution exists in profiles table
    const institution = await prisma.profile.findFirst({
      where: { 
        id: user.id,
        role: 'institution'
      }
    })

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
        image_url: iconUrl || '',
        creator_id: institution.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating community:', error)
      return NextResponse.json({ error: 'Failed to create community' }, { status: 500 })
    }

    // Auto-add the creator institution as a member
    const { error: memberError } = await supabase
      .from('academic_communities_memberships')
      .insert({
        community_id: community.id,
        member_id: institution.id
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