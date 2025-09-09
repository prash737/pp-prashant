
import { NextRequest, NextResponse } from 'next/server'
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

    // Fetch user achievements using direct Supabase query
    console.log('🔍 Supabase Query: Fetching achievements for user:', userId)
    console.log('📝 Query Details: SELECT * FROM user_achievements WHERE user_id = ? ORDER BY date_of_achievement DESC')
    
    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('date_of_achievement', { ascending: false })

    if (error) {
      console.error('❌ Error fetching achievements:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log('✅ Supabase Query Result: Found', achievements?.length || 0, 'achievements')
    console.log('📊 Achievement IDs:', achievements?.map(a => a.id) || [])

    // Transform snake_case fields to camelCase for frontend compatibility
    const transformedAchievements = (achievements || []).map(achievement => ({
      id: achievement.id,
      userId: achievement.user_id,
      name: achievement.name,
      description: achievement.description,
      dateOfAchievement: achievement.date_of_achievement,
      achievementTypeId: achievement.achievement_type_id,
      achievementImageIcon: achievement.achievement_image_icon,
      createdAt: achievement.created_at,
      updatedAt: achievement.updated_at
    }))

    return NextResponse.json({ achievements: transformedAchievements })
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

    // Create new achievement using direct Supabase query
    console.log('🔍 Supabase Query: Creating new achievement')
    console.log('📝 Query Details: INSERT INTO user_achievements VALUES (...) RETURNING *')
    
    const { data: achievement, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        name,
        description,
        date_of_achievement: new Date(dateOfAchievement),
        achievement_type_id: parseInt(achievementTypeId),
        achievement_image_icon: achievementImageIcon || null
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating achievement:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log('✅ Supabase Query Result: Achievement created with ID:', achievement?.id)

    // Transform response to camelCase for frontend compatibility
    const transformedAchievement = {
      id: achievement.id,
      userId: achievement.user_id,
      name: achievement.name,
      description: achievement.description,
      dateOfAchievement: achievement.date_of_achievement,
      achievementTypeId: achievement.achievement_type_id,
      achievementImageIcon: achievement.achievement_image_icon,
      createdAt: achievement.created_at,
      updatedAt: achievement.updated_at
    }

    return NextResponse.json({ achievement: transformedAchievement })
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

    // Verify the achievement belongs to the user before updating using Supabase
    console.log('🔍 Supabase Query: Verifying achievement ownership')
    console.log('📝 Query Details: SELECT * FROM user_achievements WHERE id = ? AND user_id = ?')
    
    const { data: existingAchievement, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('id', parseInt(achievementId))
      .eq('user_id', userId)
      .single()

    if (checkError || !existingAchievement) {
      console.log('❌ PUT /api/achievements - Achievement not found or unauthorized')
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    console.log('✅ Supabase Query Result: Found achievement for update')

    // Update the achievement using Supabase
    console.log('🔍 Supabase Query: Updating achievement')
    console.log('📝 Query Details: UPDATE user_achievements SET ... WHERE id = ? RETURNING *')
    
    const { data: updatedAchievement, error: updateError } = await supabase
      .from('user_achievements')
      .update({
        name,
        description,
        date_of_achievement: new Date(dateOfAchievement),
        achievement_type_id: parseInt(achievementTypeId),
        achievement_image_icon: achievementImageIcon || null,
        updated_at: new Date()
      })
      .eq('id', parseInt(achievementId))
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error updating achievement:', updateError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log('✅ Supabase Query Result: Achievement updated with ID:', updatedAchievement?.id)

    // Transform response to camelCase for frontend compatibility
    const transformedAchievement = {
      id: updatedAchievement.id,
      userId: updatedAchievement.user_id,
      name: updatedAchievement.name,
      description: updatedAchievement.description,
      dateOfAchievement: updatedAchievement.date_of_achievement,
      achievementTypeId: updatedAchievement.achievement_type_id,
      achievementImageIcon: updatedAchievement.achievement_image_icon,
      createdAt: updatedAchievement.created_at,
      updatedAt: updatedAchievement.updated_at
    }

    return NextResponse.json({ achievement: transformedAchievement })
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

    // Verify the achievement belongs to the user before deleting using Supabase
    console.log('🔍 Supabase Query: Verifying achievement ownership before deletion')
    console.log('📝 Query Details: SELECT * FROM user_achievements WHERE id = ? AND user_id = ?')
    
    const { data: achievement, error: checkError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('id', parseInt(achievementId))
      .eq('user_id', userId)
      .single()

    if (checkError || !achievement) {
      console.log('❌ DELETE /api/achievements - Achievement not found or unauthorized')
      return NextResponse.json({ error: 'Achievement not found' }, { status: 404 })
    }

    console.log('✅ Supabase Query Result: Found achievement for deletion')

    // Delete the achievement using Supabase
    console.log('🔍 Supabase Query: Deleting achievement')
    console.log('📝 Query Details: DELETE FROM user_achievements WHERE id = ? AND user_id = ?')
    
    const { error: deleteError } = await supabase
      .from('user_achievements')
      .delete()
      .eq('id', parseInt(achievementId))
      .eq('user_id', userId)

    if (deleteError) {
      console.error('❌ Error deleting achievement:', deleteError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    console.log('✅ Supabase Query Result: Achievement deleted successfully')

    return NextResponse.json({ message: 'Achievement deleted successfully' })
  } catch (error) {
    console.error('❌ Error deleting achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
