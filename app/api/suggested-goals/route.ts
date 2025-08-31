
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { suggestedGoals } from '@/lib/drizzle/schema'
import { eq } from 'drizzle-orm'

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

    // Get suggested goals for the user
    const userSuggestedGoals = await db.select().from(suggestedGoals)
      .where(eq(suggestedGoals.userId, user.id))

    console.log(`✅ Found ${userSuggestedGoals.length} suggested goals for user ${user.id}`)

    return NextResponse.json({ suggestedGoals: userSuggestedGoals })

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

    // Create new suggested goal
    const newGoal = await db.insert(suggestedGoals)
      .values({
        userId: user.id,
        title: title.trim(),
        description: description?.trim() || '',
        category: category?.trim() || '',
        timeframe: timeframe?.trim() || '',
        isAdded: false,
      })
      .returning()

    console.log('✅ Successfully created suggested goal:', newGoal[0])

    return NextResponse.json({
      message: 'Suggested goal created successfully',
      goal: newGoal[0]
    })

  } catch (error) {
    console.error('Create suggested goal error:', error)
    return NextResponse.json(
      { error: 'Failed to create suggested goal' },
      { status: 500 }
    )
  }
}
