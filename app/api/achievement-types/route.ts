
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Fetch achievement types using direct Supabase query
    const { data: types, error } = await supabase
      .from('achievement_types')
      .select('*')
      .eq('category_id', parseInt(categoryId))
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Error fetching achievement types:', error)
      return NextResponse.json(
        { error: 'Failed to fetch achievement types' },
        { status: 500 }
      )
    }

    // Transform snake_case fields to camelCase for frontend compatibility
    const transformedTypes = (types || []).map(type => ({
      id: type.id,
      name: type.name,
      categoryId: type.category_id
    }))

    return NextResponse.json({ types: transformedTypes })
  } catch (error) {
    console.error('Error fetching achievement types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievement types' },
      { status: 500 }
    )
  }
}
