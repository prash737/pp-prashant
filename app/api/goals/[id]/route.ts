
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const goalId = params.id

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 })
    }

    // Check if Goal model exists
    if (!prisma.goal) {
      console.error('Goal model not found in Prisma client')
      return NextResponse.json({ error: 'Goal model not available' }, { status: 500 })
    }

    // Verify the goal belongs to the user before deleting
    const goal = await prisma.goal.findFirst({
      where: { 
        id: parseInt(goalId),
        userId: user.id 
      }
    })

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    // Delete the goal
    await prisma.goal.delete({
      where: { id: parseInt(goalId) }
    })

    return NextResponse.json({ message: 'Goal deleted successfully' })
  } catch (error) {
    console.error('Goals delete API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
