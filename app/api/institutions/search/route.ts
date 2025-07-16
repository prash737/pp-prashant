
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
