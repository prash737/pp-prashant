
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const skillCategories = await prisma.skillCategory.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories: skillCategories })
  } catch (error) {
    console.error('Error fetching skill categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
