
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Fetching achievement categories')
    
    if (!prisma) {
      console.error('❌ Prisma client is not initialized')
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const categories = await prisma.achievementCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`✅ Fetched ${categories.length} achievement categories`)
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('❌ Error fetching achievement categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievement categories' },
      { status: 500 }
    )
  }
}
