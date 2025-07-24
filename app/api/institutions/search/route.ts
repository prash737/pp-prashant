
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ institutions: [] })
    }

    // Search for institutions matching the query
    const institutions = await prisma.institutionProfile.findMany({
      where: {
        institutionName: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        institutionTypeRef: {
          include: {
            category: true
          }
        }
      },
      take: 10, // Limit results to 10
      orderBy: {
        institutionName: 'asc'
      }
    })

    // Transform the data for the frontend
    const transformedInstitutions = institutions.map(institution => ({
      id: institution.id,
      name: institution.institutionName,
      type: institution.institutionType,
      typeId: institution.institutionTypeId,
      categoryId: institution.institutionTypeRef?.category?.id,
      categoryName: institution.institutionTypeRef?.category?.name,
      typeName: institution.institutionTypeRef?.name
    }))

    return NextResponse.json({ institutions: transformedInstitutions })
  } catch (error) {
    console.error('Error searching institutions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ institutions: [] })
    }

    // Search institutions by name
    const { data: institutions, error } = await supabase
      .from('institution_profiles')
      .select('id, name, logo, type, location')
      .ilike('name', `%${query}%`)
      .limit(20)

    if (error) {
      console.error('Error searching institutions:', error)
      return NextResponse.json({ error: 'Failed to search institutions' }, { status: 500 })
    }

    return NextResponse.json({ institutions })
  } catch (error) {
    console.error('Error in GET /api/institutions/search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
