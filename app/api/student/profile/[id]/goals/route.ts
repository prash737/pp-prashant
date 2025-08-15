
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    
    console.log('API: Student goals request received for:', studentId)

    // Get goals for the specific student - optimized query
    const goals = await prisma.goal.findMany({
      where: {
        userId: studentId
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        category: true,
        timeframe: true,
        status: true,
        priority: true,
        targetDate: true,
        progress: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`API: Found ${goals.length} goals for student ${studentId}`)

    return NextResponse.json({ goals })
  } catch (error) {
    console.error('Error fetching student goals:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
