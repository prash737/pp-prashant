
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const types = await prisma.achievementType.findMany({
      where: {
        categoryId: parseInt(categoryId)
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ types })
  } catch (error) {
    console.error('Error fetching achievement types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievement types' },
      { status: 500 }
    )
  }
}
