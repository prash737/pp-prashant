import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db/drizzle'
import { userAchievements } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id

    // Fetch user achievements using Drizzle
    const achievements = await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.dateOfAchievement))

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const body = await request.json()
    const { name, description, dateOfAchievement, achievementTypeId, achievementImageIcon } = body

    if (!name || !description || !dateOfAchievement || !achievementTypeId) {
      return NextResponse.json(
        { error: 'Name, description, date, and achievement type are required' },
        { status: 400 }
      )
    }

    // Create new achievement using Drizzle
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

    return NextResponse.json({ achievement: achievement[0] })
  } catch (error) {
    console.error('Error creating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get('id')

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { name, description, dateOfAchievement, achievementTypeId, achievementImageIcon } = body

    if (!name || !description || !dateOfAchievement || !achievementTypeId) {
      return NextResponse.json(
        { error: 'Name, description, date, and achievement type are required' },
        { status: 400 }
      )
    }

    // Verify the achievement belongs to the user before updating using Drizzle
    const existingAchievement = await db.query.userAchievements.findFirst({
      where: (achievements, { eq }) => eq(achievements.id, parseInt(achievementId)),
    })

    if (!existingAchievement || existingAchievement.userId !== userId) {
      return NextResponse.json({ error: 'Achievement not found or unauthorized' }, { status: 404 })
    }

    // Update the achievement using Drizzle
    const updatedAchievement = await db
      .update(userAchievements)
      .set({
        name,
        description,
        dateOfAchievement: new Date(dateOfAchievement),
        achievementTypeId: parseInt(achievementTypeId),
        achievementImageIcon: achievementImageIcon || null
      })
      .where(eq(userAchievements.id, parseInt(achievementId)))
      .returning()

    return NextResponse.json({ achievement: updatedAchievement[0] })
  } catch (error) {
    console.error('Error updating achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authData.user.id
    const { searchParams } = new URL(request.url)
    const achievementId = searchParams.get('id')

    if (!achievementId) {
      return NextResponse.json({ error: 'Achievement ID is required' }, { status: 400 })
    }

    // Verify the achievement belongs to the user before deleting using Drizzle
    const achievement = await db.query.userAchievements.findFirst({
      where: (achievements, { eq }) => eq(achievements.id, parseInt(achievementId)),
    })

    if (!achievement || achievement.userId !== userId) {
      return NextResponse.json({ error: 'Achievement not found or unauthorized' }, { status: 404 })
    }

    // Delete the achievement using Drizzle
    await db
      .delete(userAchievements)
      .where(eq(userAchievements.id, parseInt(achievementId)))

    return NextResponse.json({ message: 'Achievement deleted successfully' })
  } catch (error) {
    console.error('Error deleting achievement:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}