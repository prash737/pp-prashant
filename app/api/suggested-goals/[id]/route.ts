
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { suggestedGoals } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🎯 Update suggested goal request received for ID:', params.id)

    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const goalId = parseInt(params.id)
    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 })
    }

    // Update the suggested goal's is_added status to true
    const updateResult = await db.update(suggestedGoals)
      .set({ isAdded: true })
      .where(and(
        eq(suggestedGoals.id, goalId),
        eq(suggestedGoals.userId, user.id)
      ))
      .returning({ id: suggestedGoals.id, title: suggestedGoals.title })

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Goal not found or not authorized' }, { status: 404 })
    }

    console.log('✅ Successfully updated suggested goal:', updateResult[0])

    return NextResponse.json({
      message: 'Goal added to profile successfully',
      goal: updateResult[0]
    })

  } catch (error) {
    console.error('Update suggested goal error:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    )
  }
}
