
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching institution types and categories')

    // Fetch institution categories with their types using Supabase
    const { data: categories, error: categoriesError } = await supabase
      .from('institution_categories')
      .select(`
        id,
        name,
        slug,
        description,
        institution_types (
          id,
          name,
          slug
        )
      `)
      .order('name')

    if (categoriesError) {
      console.error('Error fetching institution categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch institution types' },
        { status: 500 }
      )
    }

    // Transform the data to match the expected format
    const transformedData = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      types: (category.institution_types || []).map(type => ({
        id: type.id,
        name: type.name,
        slug: type.slug
      }))
    }))

    console.log('✅ Successfully fetched', transformedData.length, 'categories with types')

    return NextResponse.json({
      success: true,
      data: transformedData
    })
  } catch (error) {
    console.error('Error in GET /api/institution-types:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        data: []
      },
      { status: 500 }
    )
  }
}
