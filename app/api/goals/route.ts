
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

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

    // Check if Goal model exists
    if (!prisma.goal) {
      console.error('Goal model not found in Prisma client')
      return NextResponse.json({ error: 'Goal model not available' }, { status: 500 })
    }

    // Fetch user's goals using Prisma
    const goals = await prisma.goal.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ goals })
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

    const { goals } = await request.json()

    if (!Array.isArray(goals)) {
      return NextResponse.json({ error: 'Goals must be an array' }, { status: 400 })
    }

    // Check if Goal model exists
    if (!prisma.goal) {
      console.error('Goal model not found in Prisma client')
      return NextResponse.json({ error: 'Goal model not available' }, { status: 500 })
    }

    // Get existing goals from database
    const existingGoals = await prisma.goal.findMany({
      where: {
        userId: user.id
      }
    })

    // Separate new goals (negative IDs) from existing goals (positive IDs)
    const newGoals = goals.filter(goal => typeof goal.id === 'number' && goal.id < 0)
    const existingGoalsFromClient = goals.filter(goal => typeof goal.id === 'number' && goal.id > 0)

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

    // Delete removed goals
    if (goalsToDelete.length > 0) {
      const deleteResult = await prisma.goal.deleteMany({
        where: {
          userId: user.id,
          id: {
            in: goalsToDelete.map(goal => goal.id)
          }
        }
      })
      operationsCount += deleteResult.count
      console.log(`🗑️ Deleted ${deleteResult.count} goals`)
    }

    // Insert new goals
    if (newGoals.length > 0) {
      const goalsToInsert = newGoals.map(goal => ({
        userId: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        completed: false
      }))

      const insertResult = await prisma.goal.createMany({
        data: goalsToInsert
      })
      operationsCount += insertResult.count
      console.log(`➕ Added ${insertResult.count} new goals`)
    }

    // Update existing goals that have changes
    for (const goalToUpdate of goalsToUpdate) {
      await prisma.goal.update({
        where: {
          id: goalToUpdate.id,
          userId: user.id
        },
        data: {
          title: goalToUpdate.title,
          description: goalToUpdate.description || null,
          category: goalToUpdate.category || null,
          timeframe: goalToUpdate.timeframe || null
        }
      })
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
