
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/drizzle/client'
import { userAchievements } from '@/lib/drizzle/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET /api/achievements - Request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ GET /api/achievements - No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ GET /api/achievements - Auth verification failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    console.log('✅ GET /api/achievements - User authenticated:', userId)

    // Fetch user achievements using Drizzle
    console.log('🔍 Drizzle Query: Fetching achievements for user:', userId)
    console.log('📝 Query Details: SELECT * FROM user_achievements WHERE userId = ? ORDER BY dateOfAchievement DESC')
    
    const achievements = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.dateOfAchievement))

    console.log('✅ Drizzle Query Result: Found', achievements.length, 'achievements')
    console.log('📊 Achievement IDs:', achievements.map(a => a.id))

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('❌ Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 POST /api/achievements - Request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ POST /api/achievements - No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ POST /api/achievements - Auth verification failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const body = await request.json()
    const { name, description, dateOfAchievement, achievementTypeId, achievementImageIcon } = body

    console.log('✅ POST /api/achievements - User authenticated:', userId)
    console.log('📝 Achievement data:', { name, description, dateOfAchievement, achievementTypeId })

    if (!name || !description || !dateOfAchievement || !achievementTypeId) {
      console.log('❌ POST /api/achievements - Missing required fields')
      return NextResponse.json(
        { error: 'Name, description, date, and achievement type are required' },
        { status: 400 }
      )
    }

    // Create new achievement using Drizzle
    console.log('🔍 Drizzle Query: Creating new achievement')
    console.log('📝 Query Details: INSERT INTO user_achievements VALUES (...) RETURNING *')
    
    const achievement = await db
      .insert(userAchievements)
      .values({
        userId,
        name,
        description,
        dateOfAchievement: new Date(dateOfAchievement),
        achievementTypeId: parseInt(achievementTypeId),
        achievementImageIcon: achievementImageIcon || null
      })
      .returning()

    console.log('✅ Drizzle Query Result: Achievement created with ID:', achievement[0]?.id)

    return NextResponse.json({ achievement: achievement[0] })
  } catch (error) {
    console.error('❌ Error creating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🎯 PUT /api/achievements - Request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ PUT /api/achievements - No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ PUT /api/achievements - Auth verification failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get('id')

    console.log('✅ PUT /api/achievements - User authenticated:', userId)
    console.log('📝 Achievement ID to update:', achievementId)

    if (!achievementId) {
      console.log('❌ PUT /api/achievements - Missing achievement ID')
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, dateOfAchievement, achievementTypeId, achievementImageIcon } = body

    console.log('📝 Update data:', { name, description, dateOfAchievement, achievementTypeId })

    if (!name || !description || !dateOfAchievement || !achievementTypeId) {
      console.log('❌ PUT /api/achievements - Missing required fields')
      return NextResponse.json(
        { error: 'Name, description, date, and achievement type are required' },
        { status: 400 }
      )
    }

    // Verify the achievement belongs to the user before updating using Drizzle
    console.log('🔍 Drizzle Query: Verifying achievement ownership')
    console.log('📝 Query Details: SELECT * FROM user_achievements WHERE id = ? LIMIT 1')
    
    const existingAchievement = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.id, parseInt(achievementId)))
      .limit(1)

    console.log('✅ Drizzle Query Result: Found achievement:', existingAchievement.length > 0)

    if (!existingAchievement.length || existingAchievement[0].userId !== userId) {
      console.log('❌ PUT /api/achievements - Achievement not found or unauthorized')
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Update the achievement using Drizzle
    console.log('🔍 Drizzle Query: Updating achievement')
    console.log('📝 Query Details: UPDATE user_achievements SET ... WHERE id = ? RETURNING *')
    
    const updatedAchievement = await db
      .update(userAchievements)
      .set({
        name,
        description,
        dateOfAchievement: new Date(dateOfAchievement),
        achievementTypeId: parseInt(achievementTypeId),
        achievementImageIcon: achievementImageIcon || null,
        updatedAt: new Date()
      })
      .where(eq(userAchievements.id, parseInt(achievementId)))
      .returning()

    console.log('✅ Drizzle Query Result: Achievement updated with ID:', updatedAchievement[0]?.id)

    return NextResponse.json({ achievement: updatedAchievement[0] })
  } catch (error) {
    console.error('❌ Error updating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🎯 DELETE /api/achievements - Request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ DELETE /api/achievements - No token found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ DELETE /api/achievements - Auth verification failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get('id')

    console.log('✅ DELETE /api/achievements - User authenticated:', userId)
    console.log('📝 Achievement ID to delete:', achievementId)

    if (!achievementId) {
      console.log('❌ DELETE /api/achievements - Missing achievement ID')
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    // Verify the achievement belongs to the user before deleting using Drizzle
    console.log('🔍 Drizzle Query: Verifying achievement ownership before deletion')
    console.log('📝 Query Details: SELECT * FROM user_achievements WHERE id = ? LIMIT 1')
    
    const achievement = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.id, parseInt(achievementId)))
      .limit(1)

    console.log('✅ Drizzle Query Result: Found achievement for deletion:', achievement.length > 0)

    if (!achievement.length || achievement[0].userId !== userId) {
      console.log('❌ DELETE /api/achievements - Achievement not found or unauthorized')
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    // Delete the achievement using Drizzle
    console.log('🔍 Drizzle Query: Deleting achievement')
    console.log('📝 Query Details: DELETE FROM user_achievements WHERE id = ?')
    
    await db
      .delete(userAchievements)
      .where(eq(userAchievements.id, parseInt(achievementId)))

    console.log('✅ Drizzle Query Result: Achievement deleted successfully')

    return NextResponse.json({ message: 'Achievement deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
