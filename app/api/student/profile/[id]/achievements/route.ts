import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    console.log('API: Student achievements request received for:', studentId)

    // Get achievements for the specific student - optimized query
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: studentId
      },
      select: {
        id: true,
        userId: true,
        name: true,
        description: true,
        dateOfAchievement: true,
        achievementTypeId: true,
        achievementImageIcon: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        dateOfAchievement: 'desc'
      }
    })

    console.log(`API: Found ${achievements.length} achievements for student ${studentId}`)

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching student achievements:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}