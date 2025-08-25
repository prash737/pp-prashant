import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { goals, suggestedGoals } from '@/lib/drizzle/schema'
import { createClient } from '@supabase/supabase-js'
import { eq, desc, and } from 'drizzle-orm'

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

    // Get goals for the specific student using Drizzle
    const userGoals = await db.select().from(goals)
      .where(eq(goals.userId, studentId))
      .orderBy(desc(goals.createdAt))

    // Get suggested goals that have been added (is_added = true) using Drizzle
    const userSuggestedGoals = await db.select().from(suggestedGoals)
      .where(and(
        eq(suggestedGoals.userId, studentId),
        eq(suggestedGoals.isAdded, true)
      ))
      .orderBy(desc(suggestedGoals.createdAt))

    // Combine both goal types into a single array
    const allGoals = [
      ...userGoals.map(g => ({
        ...g,
        isSuggested: false
      })),
      ...userSuggestedGoals.map(sg => ({
        id: sg.id,
        title: sg.title,
        description: sg.description || '',
        category: sg.category || '',
        timeframe: sg.timeframe || '',
        userId: sg.userId,
        completed: false, // suggested goals don't have completed status
        createdAt: sg.createdAt,
        updatedAt: sg.createdAt, // use createdAt as updatedAt for suggested goals
        isSuggested: true // flag to identify suggested goals
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log(`API: Found ${userGoals.length} regular goals and ${userSuggestedGoals.length} suggested goals for student ${studentId}`)

    return NextResponse.json({ goals: allGoals })
  } catch (error) {
    console.error('Error fetching student goals:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}