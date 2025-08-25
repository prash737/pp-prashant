
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { suggestedGoals } from '@/lib/drizzle/schema'
import { eq, desc } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET suggested goals request received')

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

    // Fetch all suggested goals for the user
    const userSuggestedGoals = await db.select().from(suggestedGoals)
      .where(eq(suggestedGoals.userId, user.id))
      .orderBy(desc(suggestedGoals.createdAt))

    console.log(`✅ Found ${userSuggestedGoals.length} suggested goals for user ${user.id}`)

    return NextResponse.json({ 
      suggestedGoals: userSuggestedGoals.map(sg => ({
        ...sg,
        isSuggested: true
      }))
    })

  } catch (error) {
    console.error('Get suggested goals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggested goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST suggested goals request received')

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

    const { suggestedGoals: goalsList } = await request.json()

    if (!Array.isArray(goalsList)) {
      return NextResponse.json({ error: 'Suggested goals must be an array' }, { status: 400 })
    }

    // Get existing suggested goals from database
    const existingSuggestedGoals = await db.select().from(suggestedGoals)
      .where(eq(suggestedGoals.userId, user.id))

    // Separate new goals (negative IDs) from existing goals (positive IDs)
    const newGoals = goalsList.filter(goal => typeof goal.id === 'number' && goal.id < 0)
    const existingGoalsFromClient = goalsList.filter(goal => typeof goal.id === 'number' && goal.id > 0)

    // Find goals to delete (exist in DB but not in client)
    const existingGoalIds = existingGoalsFromClient.map(goal => goal.id)
    const goalsToDelete = existingSuggestedGoals.filter(goal => !existingGoalIds.includes(goal.id))

    // Find goals to update (exist in both but might have changes)
    const goalsToUpdate = existingGoalsFromClient.filter(clientGoal => {
      const dbGoal = existingSuggestedGoals.find(g => g.id === clientGoal.id)
      if (!dbGoal) return false

      // Check if any field has changed
      return (
        dbGoal.title !== clientGoal.title ||
        dbGoal.description !== (clientGoal.description || null) ||
        dbGoal.category !== (clientGoal.category || null) ||
        dbGoal.timeframe !== (clientGoal.timeframe || null) ||
        dbGoal.isAdded !== (clientGoal.isAdded || false)
      )
    })

    let operationsCount = 0

    // Delete removed goals
    if (goalsToDelete.length > 0) {
      for (const goal of goalsToDelete) {
        await db.delete(suggestedGoals)
          .where(eq(suggestedGoals.id, goal.id))
        operationsCount++
      }
      console.log(`🗑️ Deleted ${goalsToDelete.length} suggested goals`)
    }

    // Insert new goals
    if (newGoals.length > 0) {
      const goalsToInsert = newGoals.map(goal => ({
        userId: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        isAdded: goal.isAdded || false
      }))

      const insertResult = await db.insert(suggestedGoals)
        .values(goalsToInsert)
        .returning({ id: suggestedGoals.id })

      operationsCount += insertResult.length
      console.log(`➕ Added ${insertResult.length} new suggested goals`)
    }

    // Update existing goals that have changes
    for (const goalToUpdate of goalsToUpdate) {
      await db.update(suggestedGoals)
        .set({
          title: goalToUpdate.title,
          description: goalToUpdate.description || null,
          category: goalToUpdate.category || null,
          timeframe: goalToUpdate.timeframe || null,
          isAdded: goalToUpdate.isAdded || false
        })
        .where(eq(suggestedGoals.id, goalToUpdate.id))

      operationsCount++
    }

    if (goalsToUpdate.length > 0) {
      console.log(`✏️ Updated ${goalsToUpdate.length} suggested goals`)
    }

    if (operationsCount === 0) {
      console.log(`✅ No changes detected - suggested goals are already up to date`)
      return NextResponse.json({
        message: 'No changes detected - suggested goals are already up to date',
        operations: 0
      })
    }

    console.log(`✅ Successfully processed ${operationsCount} suggested goal operations for user ${user.id}`)
    return NextResponse.json({
      message: 'Suggested goals updated successfully',
      operations: operationsCount,
      deleted: goalsToDelete.length,
      added: newGoals.length,
      updated: goalsToUpdate.length
    })

  } catch (error) {
    console.error('Suggested goals save API error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
