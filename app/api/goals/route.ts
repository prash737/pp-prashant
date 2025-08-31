import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { goals } from '@/lib/drizzle/schema'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { eq, desc } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
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

    // Fetch user's goals using Drizzle
    const userGoals = await db.select().from(goals)
      .where(eq(goals.userId, user.id))
      .orderBy(desc(goals.createdAt))

    return NextResponse.json({ goals: userGoals })
  } catch (error) {
    console.error('Goals API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { goals: goalsList } = await request.json()

    if (!Array.isArray(goalsList)) {
      return NextResponse.json({ error: 'Goals must be an array' }, { status: 400 })
    }

    // Get existing goals from database using Drizzle
    const existingGoals = await db.select().from(goals)
      .where(eq(goals.userId, user.id))

    // Separate new goals (negative IDs) from existing goals (positive IDs)
    const newGoals = goalsList.filter(goal => typeof goal.id === 'number' && goal.id < 0)
    const existingGoalsFromClient = goalsList.filter(goal => typeof goal.id === 'number' && goal.id > 0)

    // Find goals to delete (exist in DB but not in client)
    const existingGoalIds = existingGoalsFromClient.map(goal => goal.id)
    const goalsToDelete = existingGoals.filter(goal => !existingGoalIds.includes(goal.id))

    // Find goals to update (exist in both but might have changes)
    const goalsToUpdate = existingGoalsFromClient.filter(clientGoal => {
      const dbGoal = existingGoals.find(g => g.id === clientGoal.id)
      if (!dbGoal) return false

      // Check if any field has changed
      return (
        dbGoal.title !== clientGoal.title ||
        dbGoal.description !== (clientGoal.description || null) ||
        dbGoal.category !== (clientGoal.category || null) ||
        dbGoal.timeframe !== (clientGoal.timeframe || null)
      )
    })

    let operationsCount = 0

    // Delete removed goals using Drizzle
    if (goalsToDelete.length > 0) {
      const deleteResult = await db.delete(goals)
        .where(eq(goals.userId, user.id) && goals.id.in(goalsToDelete.map(goal => goal.id)))
        .returning({ count: goals.id })

      operationsCount += deleteResult.length
      console.log(`🗑️ Deleted ${deleteResult.length} goals`)
    }

    // Insert new goals using Drizzle
    if (newGoals.length > 0) {
      const goalsToInsert = newGoals.map(goal => ({
        userId: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        completed: false
      }))

      const insertResult = await db.insert(goals)
        .values(goalsToInsert)
        .returning({ id: goals.id })

      operationsCount += insertResult.length
      console.log(`➕ Added ${insertResult.length} new goals`)
    }

    // Update existing goals that have changes using Drizzle
    for (const goalToUpdate of goalsToUpdate) {
      await db.update(goals)
        .set({
          title: goalToUpdate.title,
          description: goalToUpdate.description || null,
          category: goalToUpdate.category || null,
          timeframe: goalToUpdate.timeframe || null
        })
        .where(eq(goals.id, goalToUpdate.id) && eq(goals.userId, user.id))

      operationsCount++
    }

    if (goalsToUpdate.length > 0) {
      console.log(`✏️ Updated ${goalsToUpdate.length} goals`)
    }

    if (operationsCount === 0) {
      console.log(`✅ No changes detected - goals are already up to date`)
      return NextResponse.json({
        message: 'No changes detected - goals are already up to date',
        operations: 0
      })
    }

    console.log(`✅ Successfully processed ${operationsCount} goal operations for user ${user.id}`)
    return NextResponse.json({
      message: 'Goals updated successfully',
      operations: operationsCount,
      deleted: goalsToDelete.length,
      added: newGoals.length,
      updated: goalsToUpdate.length
    })

  } catch (error) {
    console.error('Goals save API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}