
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    
    console.log('API: Student goals request received for:', studentId)

    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('API: No access token found in cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      console.log('API: Token verification failed:', error?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    // Check if Goal model exists
    if (!prisma.goal) {
      console.error('Goal model not found in Prisma client')
      return NextResponse.json({ error: 'Goal model not available' }, { status: 500 })
    }

    // Get goals for the specific student
    const goals = await prisma.goal.findMany({
      where: {
        userId: studentId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get suggested goals that have been added (is_added = true)
    const suggestedGoals = await prisma.suggestedGoal.findMany({
      where: {
        userId: studentId,
        isAdded: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Combine both goal types into a single array
    const allGoals = [
      ...goals.map(g => ({
        ...g,
        isSuggested: false
      })),
      ...suggestedGoals.map(sg => ({
        id: sg.id,
        title: sg.title,
        description: sg.description,
        category: sg.category,
        timeframe: sg.timeframe,
        userId: sg.userId,
        completed: false, // suggested goals don't have completed status
        createdAt: sg.createdAt,
        updatedAt: sg.createdAt, // use createdAt as updatedAt for suggested goals
        isSuggested: true // flag to identify suggested goals
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log(`API: Found ${goals.length} regular goals and ${suggestedGoals.length} suggested goals for student ${studentId}`)

    return NextResponse.json({ goals: allGoals })
  } catch (error) {
    console.error('Error fetching student goals:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
