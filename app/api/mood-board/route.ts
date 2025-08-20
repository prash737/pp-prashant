
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { userCollections, moodBoard } from '@/lib/drizzle/schema'
import { eq, and, or, isNull, asc, desc } from 'drizzle-orm'

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
    const shouldFilterPrivate = isPublicView === true && !isViewingOwnProfile
    
    console.log('🔍 Collections where clause:', {
      shouldFilterPrivate,
      reasoning: shouldFilterPrivate ? 'Filtering private collections' : 'Showing all collections including private'
    })

    // Get collections with their mood board items
    let collectionsQuery = db
      .select()
      .from(userCollections)
      .where(eq(userCollections.userId, userId))
      .orderBy(desc(userCollections.createdAt))

    if (shouldFilterPrivate) {
      collectionsQuery = db
        .select()
        .from(userCollections)
        .where(
          and(
            eq(userCollections.userId, userId),
            or(
              eq(userCollections.isPrivate, false),
              isNull(userCollections.isPrivate)
            )
          )
        )
        .orderBy(desc(userCollections.createdAt))
    }

    const collections = await collectionsQuery

    // Get mood board items for each collection
    const collectionsWithItems = await Promise.all(
      collections.map(async (collection) => {
        const items = await db
          .select()
          .from(moodBoard)
          .where(eq(moodBoard.collectionId, collection.id))
          .orderBy(asc(moodBoard.position))

        return {
          ...collection,
          moodBoard: items
        }
      })
    )

    // Also get mood board items without collections (legacy support)
    const uncategorizedItems = await db
      .select()
      .from(moodBoard)
      .where(
        and(
          eq(moodBoard.userId, userId),
          isNull(moodBoard.collectionId)
        )
      )
      .orderBy(asc(moodBoard.position))

    return NextResponse.json({ 
      collections: collectionsWithItems,
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

    const [newItem] = await db
      .insert(moodBoard)
      .values({
        userId,
        imageUrl,
        caption: caption || '',
        position: position || 0,
        collectionId: collectionId || null
      })
      .returning()

    return NextResponse.json({ success: true, item: newItem })
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
      await db
        .update(moodBoard)
        .set({ caption })
        .where(eq(moodBoard.id, itemId))
      
      return NextResponse.json({ success: true })
    }

    // Handle bulk update (for backward compatibility)
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        await db
          .update(moodBoard)
          .set({ 
            position: i,
            caption: items[i].caption || ''
          })
          .where(eq(moodBoard.id, items[i].id))
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

    await db
      .delete(moodBoard)
      .where(eq(moodBoard.id, itemId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting mood board item:', error)
    return NextResponse.json({ error: 'Failed to delete mood board item' }, { status: 500 })
  }
}
