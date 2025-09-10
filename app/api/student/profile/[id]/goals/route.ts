
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

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

    // Get goals for the specific student using direct Supabase query
    const { data: userGoals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false })

    if (goalsError) {
      console.error('Error fetching goals:', goalsError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Get suggested goals that have been added (is_added = true) using direct Supabase query
    const { data: userSuggestedGoals, error: suggestedError } = await supabase
      .from('suggested_goals')
      .select('*')
      .eq('user_id', studentId)
      .eq('is_added', true)
      .order('created_at', { ascending: false })

    if (suggestedError) {
      console.error('Error fetching suggested goals:', suggestedError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Transform regular goals to camelCase
    const transformedGoals = (userGoals || []).map(g => ({
      id: g.id,
      title: g.title,
      description: g.description,
      category: g.category,
      timeframe: g.timeframe,
      userId: g.user_id,
      completed: g.completed,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
      isSuggested: false
    }))

    // Transform suggested goals to camelCase and format for consistency
    const transformedSuggestedGoals = (userSuggestedGoals || []).map(sg => ({
      id: sg.id,
      title: sg.title,
      description: sg.description,
      category: sg.category,
      timeframe: sg.timeframe,
      userId: sg.user_id,
      completed: false, // suggested goals don't have completed status
      createdAt: sg.created_at,
      updatedAt: sg.created_at, // use createdAt as updatedAt for suggested goals
      isSuggested: true // flag to identify suggested goals
    }))

    // Combine both goal types into a single array
    const allGoals = [
      ...transformedGoals,
      ...transformedSuggestedGoals
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log(`API: Found ${transformedGoals.length} regular goals and ${transformedSuggestedGoals.length} suggested goals for student ${studentId}`)

    return NextResponse.json({ goals: allGoals })
  } catch (error) {
    console.error('Error fetching student goals:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
