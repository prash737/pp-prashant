
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Suggested goals fetch request received')

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

    // Get suggested goals for the user using direct Supabase query
    const { data: userSuggestedGoals, error: fetchError } = await supabase
      .from('suggested_goals')
      .select('*')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('Error fetching suggested goals:', fetchError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transformedSuggestedGoals = (userSuggestedGoals || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      timeframe: goal.timeframe,
      isAdded: goal.is_added,
      createdAt: goal.created_at
    }))

    console.log(`✅ Found ${transformedSuggestedGoals.length} suggested goals for user ${user.id}`)

    return NextResponse.json({ suggestedGoals: transformedSuggestedGoals })

  } catch (error) {
    console.error('Suggested goals fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggested goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Create suggested goal request received')

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

    const { title, description, category, timeframe } = await request.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Create new suggested goal using direct Supabase query
    const { data: newGoal, error: insertError } = await supabase
      .from('suggested_goals')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() || '',
        category: category?.trim() || '',
        timeframe: timeframe?.trim() || '',
        is_added: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating suggested goal:', insertError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform response to camelCase for frontend compatibility
    const transformedGoal = {
      id: newGoal.id,
      userId: newGoal.user_id,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      timeframe: newGoal.timeframe,
      isAdded: newGoal.is_added,
      createdAt: newGoal.created_at
    }

    console.log('✅ Successfully created suggested goal:', transformedGoal)

    return NextResponse.json({
      message: 'Suggested goal created successfully',
      goal: transformedGoal
    })

  } catch (error) {
    console.error('Create suggested goal error:', error)
    return NextResponse.json(
      { error: 'Failed to create suggested goal' },
      { status: 500 }
    )
  }
}
