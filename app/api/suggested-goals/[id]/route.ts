
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

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

    // Update the suggested goal using direct Supabase query
    const { data: updateResult, error: updateError } = await supabase
      .from('suggested_goals')
      .update({
        title: title.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        timeframe: timeframe?.trim() || null,
      })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select('id, title, description, category, timeframe')
      .single()

    if (updateError || !updateResult) {
      console.error('Error updating suggested goal:', updateError)
      return NextResponse.json({ error: 'Goal not found or not authorized' }, { status: 404 })
    }

    console.log('✅ Successfully updated suggested goal:', updateResult)

    return NextResponse.json({
      message: 'Suggested goal updated successfully',
      goal: updateResult
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

    // Update the suggested goal's is_added status to true using direct Supabase query
    const { data: updateResult, error: updateError } = await supabase
      .from('suggested_goals')
      .update({ is_added: true })
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select('id, title')
      .single()

    if (updateError || !updateResult) {
      console.error('Error updating suggested goal:', updateError)
      return NextResponse.json({ error: 'Goal not found or not authorized' }, { status: 404 })
    }

    console.log('✅ Successfully updated suggested goal:', updateResult)

    return NextResponse.json({
      message: 'Goal added to profile successfully',
      goal: updateResult
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

    // Delete the suggested goal using direct Supabase query
    const { data: deleteResult, error: deleteError } = await supabase
      .from('suggested_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', user.id)
      .select('id, title')
      .single()

    if (deleteError || !deleteResult) {
      console.error('Error deleting suggested goal:', deleteError)
      return NextResponse.json({ error: 'Goal not found or not authorized' }, { status: 404 })
    }

    console.log('✅ Successfully deleted suggested goal:', deleteResult)

    return NextResponse.json({
      message: 'Suggested goal deleted successfully',
      goal: deleteResult
    })

  } catch (error) {
    console.error('Delete suggested goal error:', error)
    return NextResponse.json(
      { error: 'Failed to delete suggested goal' },
      { status: 500 }
    )
  }
}
