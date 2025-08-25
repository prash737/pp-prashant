
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { suggestedGoals } from '@/lib/drizzle/schema'
import { eq, and } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { title, description, category, timeframe } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // For suggested goals, we need to update the content fields
    // First check if this suggested goal exists and belongs to the user
    const existingGoal = await db.select().from(suggestedGoals)
      .where(and(
        eq(suggestedGoals.id, goalId),
        eq(suggestedGoals.userId, user.id)
      ))
      .limit(1)

    if (existingGoal.length === 0) {
      return NextResponse.json({ error: 'Goal not found or not authorized' }, { status: 404 })
    }

    // Update the suggested goal content
    const updateResult = await db.update(suggestedGoals)
      .set({
        title: title.trim(),
        description: description?.trim() || '',
        category: category?.trim() || '',
        timeframe: timeframe?.trim() || '',
        updatedAt: new Date(),
      })
      .where(and(
        eq(suggestedGoals.id, goalId),
        eq(suggestedGoals.userId, user.id)
      ))
      .returning({
        id: suggestedGoals.id,
        title: suggestedGoals.title,
        description: suggestedGoals.description,
        category: suggestedGoals.category,
        timeframe: suggestedGoals.timeframe,
      })

    if (updateResult.length === 0) {
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
    }

    console.log('✅ Successfully updated suggested goal:', updateResult[0])

    return NextResponse.json({
      message: 'Suggested goal updated successfully',
      goal: updateResult[0]
    })

  } catch (error) {
    console.error('Update suggested goal error:', error)
    return NextResponse.json(
      { error: 'Failed to update suggested goal' },
      { status: 500 }
    )
  }
}

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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🗑️ Delete suggested goal request received for ID:', params.id)

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

    // Delete the suggested goal
    const deleteResult = await db.delete(suggestedGoals)
      .where(and(
        eq(suggestedGoals.id, goalId),
        eq(suggestedGoals.userId, user.id)
      ))
      .returning({ id: suggestedGoals.id, title: suggestedGoals.title })

    if (deleteResult.length === 0) {
      return NextResponse.json({ error: 'Goal not found or not authorized' }, { status: 404 })
    }

    console.log('✅ Successfully deleted suggested goal:', deleteResult[0])

    return NextResponse.json({
      message: 'Suggested goal deleted successfully',
      goal: deleteResult[0]
    })

  } catch (error) {
    console.error('Delete suggested goal error:', error)
    return NextResponse.json(
      { error: 'Failed to delete suggested goal' },
      { status: 500 }
    )
  }
}
