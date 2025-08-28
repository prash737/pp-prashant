
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    
    console.log('API: Student achievements request received for:', studentId)

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

    // Check if UserAchievement model exists
    if (!prisma.userAchievement) {
      console.error('UserAchievement model not found in Prisma client')
      return NextResponse.json({ error: 'UserAchievement model not available' }, { status: 500 })
    }

    // Get achievements for the specific student
    const achievements = await prisma.userAchievement.findMany({
      where: {
        userId: studentId
      },
      orderBy: {
        dateOfAchievement: 'desc'
      }
    })

    console.log(`API: Found ${achievements.length} achievements for student ${studentId}`)

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching student achievements:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
