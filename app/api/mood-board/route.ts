import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db/drizzle'
import { userCollections, moodBoard } from '@/lib/db/schema'
import { eq, and, desc, asc, isNull, inArray } from 'drizzle-orm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublicView = searchParams.get('isPublicView') === 'true'

    // Get the current user to check if they're viewing their own profile
    const cookieStore = request.cookies
    const accessToken = cookieStore.get("sb-access-token")?.value
    let currentUserId = null

    if (accessToken) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken)
        currentUserId = user?.id
      } catch (error) {
        console.error('Error getting current user:', error)
      }
    }

    const isViewingOwnProfile = currentUserId === userId

    console.log('🎯 Mood Board API called:', {
      userId: userId?.substring(0, 8) + '...',
      currentUserId: currentUserId?.substring(0, 8) + '...',
      isPublicView,
      rawIsPublicView: searchParams.get('isPublicView'),
      isViewingOwnProfile,
      shouldShowPrivate: isViewingOwnProfile || !isPublicView
    })

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build where clause for collections based on public view
    let collectionsWhere: any = { userId }

    // Only filter private collections if it's truly a public view (someone else viewing this profile)
    // AND the current user is not the profile owner
    const shouldFilterPrivate = isPublicView === true && !isViewingOwnProfile

    if (shouldFilterPrivate) {
      collectionsWhere = {
        userId,
        OR: [
          { isPrivate: false },
          { isPrivate: null }
        ]
      }
    }
    // If it's the user's own profile OR not a public view, show all collections (including private ones)

    console.log('🔍 Collections where clause:', {
      collectionsWhere,
      shouldFilterPrivate,
      reasoning: shouldFilterPrivate ? 'Filtering private collections' : 'Showing all collections including private'
    })

    // Get collections with their mood board items
    const collections = await db.query.userCollections.findMany({
      where: (cols, { eq, and, or }) => {
        if (shouldFilterPrivate) {
          return and(
            eq(cols.userId, userId),
            or(
              eq(cols.isPrivate, false),
              isNull(cols.isPrivate)
            )
          )
        }
        return eq(cols.userId, userId)
      },
      with: {
        moodBoard: {
          orderBy: (mb, { asc }) => asc(mb.position)
        }
      },
      orderBy: (cols, { desc }) => desc(cols.createdAt)
    })

    // Also get mood board items without collections (legacy support)
    const uncategorizedItems = await db.query.moodBoard.findMany({
      where: (mb, { eq, isNull }) =>
        and(
          eq(mb.userId, userId),
          isNull(mb.collectionId)
        ),
      orderBy: (mb, { asc }) => asc(mb.position)
    })

    return NextResponse.json({
      collections,
      uncategorizedItems
    })
  } catch (error) {
    console.error('Error fetching mood board:', error)
    return NextResponse.json({ error: 'Failed to fetch mood board' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, imageUrl, caption, position, collectionId } = await request.json()

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: 'User ID and image URL are required' }, { status: 400 })
    }

    await db.insert(moodBoard).values({
      userId,
      imageUrl,
      caption: caption || '',
      position: position || 0,
      collectionId: collectionId || null
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating mood board item:', error)
    return NextResponse.json({ error: 'Failed to create mood board item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { items, itemId, caption } = await request.json()

    // Handle single item caption update
    if (itemId && caption !== undefined) {
      await db.update(moodBoard).set({ caption }).where(eq(moodBoard.id, itemId))
      return NextResponse.json({ success: true })
    }

    // Handle bulk update (for backward compatibility)
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        await db.update(moodBoard).set({
          position: i,
          caption: items[i].caption || ''
        }).where(eq(moodBoard.id, items[i].id))
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
  } catch (error) {
    console.error('Error updating mood board:', error)
    return NextResponse.json({ error: 'Failed to update mood board' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    await db.delete(moodBoard).where(eq(moodBoard.id, itemId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting mood board item:', error)
    return NextResponse.json({ error: 'Failed to delete mood board item' }, { status: 500 })
  }
}