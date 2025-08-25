
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/drizzle/client'
import { goals } from '@/lib/drizzle/schema'
import { cookies } from 'next/headers'
import { eq, and } from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const goalId = params.id

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Verify the goal belongs to the user before deleting using Drizzle
    const goal = await db.select().from(goals)
      .where(and(
        eq(goals.id, parseInt(goalId)),
        eq(goals.userId, user.id)
      ))
      .limit(1)

    if (goal.length === 0) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Delete the goal using Drizzle
    await db.delete(goals)
      .where(eq(goals.id, parseInt(goalId)))

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Goals delete API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
