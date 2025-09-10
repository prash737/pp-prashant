
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

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

    // Fetch user's goals using direct Supabase query
    const { data: userGoals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transformedGoals = (userGoals || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      timeframe: goal.timeframe,
      completed: goal.completed,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }))

    return NextResponse.json({ goals: transformedGoals })
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

    // Get existing goals from database using Supabase
    const { data: existingGoals, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('Error fetching existing goals:', fetchError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Separate new goals (negative IDs) from existing goals (positive IDs)
    const newGoals = goalsList.filter(goal => typeof goal.id === 'number' && goal.id < 0)
    const existingGoalsFromClient = goalsList.filter(goal => typeof goal.id === 'number' && goal.id > 0)

    // Find goals to delete (exist in DB but not in client)
    const existingGoalIds = existingGoalsFromClient.map(goal => goal.id)
    const goalsToDelete = (existingGoals || []).filter(goal => !existingGoalIds.includes(goal.id))

    // Find goals to update (exist in both but might have changes)
    const goalsToUpdate = existingGoalsFromClient.filter(clientGoal => {
      const dbGoal = (existingGoals || []).find(g => g.id === clientGoal.id)
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

    // Delete removed goals using Supabase
    if (goalsToDelete.length > 0) {
      const deleteIds = goalsToDelete.map(goal => goal.id)
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', user.id)
        .in('id', deleteIds)

      if (deleteError) {
        console.error('Error deleting goals:', deleteError)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }

      operationsCount += goalsToDelete.length
      console.log(`🗑️ Deleted ${goalsToDelete.length} goals`)
    }

    // Insert new goals using Supabase
    if (newGoals.length > 0) {
      const goalsToInsert = newGoals.map(goal => ({
        user_id: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        completed: false
      }))

      const { data: insertResult, error: insertError } = await supabase
        .from('goals')
        .insert(goalsToInsert)
        .select('id')

      if (insertError) {
        console.error('Error inserting goals:', insertError)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }

      operationsCount += insertResult?.length || 0
      console.log(`➕ Added ${insertResult?.length || 0} new goals`)
    }

    // Update existing goals that have changes using Supabase
    for (const goalToUpdate of goalsToUpdate) {
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          title: goalToUpdate.title,
          description: goalToUpdate.description || null,
          category: goalToUpdate.category || null,
          timeframe: goalToUpdate.timeframe || null,
          updated_at: new Date()
        })
        .eq('id', goalToUpdate.id)
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating goal:', updateError)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }

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
