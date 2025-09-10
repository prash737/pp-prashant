
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ institutions: [] })
    }

    console.log('🔍 Searching institutions for query:', query)

    // Search institutions using Supabase text search
    const { data: institutions, error: searchError } = await supabase
      .from('institution_profiles')
      .select(`
        id,
        institution_name,
        institution_type_id,
        verified,
        institution_types!inner (
          id,
          name,
          slug,
          institution_categories!inner (
            id,
            name,
            slug
          )
        )
      `)
      .ilike('institution_name', `%${query}%`)
      .limit(10)

    if (searchError) {
      console.error('Error searching institutions:', searchError)
      return NextResponse.json(
        { error: 'Failed to search institutions' },
        { status: 500 }
      )
    }

    // Transform the results to match the expected format
    const transformedInstitutions = (institutions || []).map(institution => ({
      id: institution.id,
      name: institution.institution_name,
      type: institution.institution_type_id?.toString() || '',
      typeId: institution.institution_type_id?.toString() || '',
      categoryId: institution.institution_types?.institution_categories?.id?.toString() || '',
      categoryName: institution.institution_types?.institution_categories?.name || '',
      typeName: institution.institution_types?.name || '',
      verified: institution.verified || false
    }))

    console.log('✅ Found', transformedInstitutions.length, 'institutions matching query')

    return NextResponse.json({ institutions: transformedInstitutions })
  } catch (error) {
    console.error('Error in GET /api/institutions/search:', error)
    return NextResponse.json(
      { error: 'Internal server error', institutions: [] },
      { status: 500 }
    )
  }
}
