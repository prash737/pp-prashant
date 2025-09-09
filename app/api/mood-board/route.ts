
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    let collectionsQuery = supabase
      .from('user_collections')
      .select(`
        id,
        user_id,
        name,
        description,
        is_private,
        created_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (shouldFilterPrivate) {
      collectionsQuery = collectionsQuery.or('is_private.is.null,is_private.eq.false')
    }

    const { data: collections, error: collectionsError } = await collectionsQuery

    if (collectionsError) {
      console.error('Error fetching collections:', collectionsError)
      return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
    }

    // Get mood board items for each collection
    const collectionsWithItems = await Promise.all(
      (collections || []).map(async (collection) => {
        const { data: items, error: itemsError } = await supabase
          .from('mood_board')
          .select('*')
          .eq('collection_id', collection.id)
          .order('position', { ascending: true })

        if (itemsError) {
          console.error('Error fetching mood board items:', itemsError)
          return {
            ...collection,
            userId: collection.user_id,
            isPrivate: collection.is_private,
            createdAt: collection.created_at,
            moodBoard: []
          }
        }

        return {
          ...collection,
          userId: collection.user_id,
          isPrivate: collection.is_private,
          createdAt: collection.created_at,
          moodBoard: items?.map(item => ({
            ...item,
            userId: item.user_id,
            imageUrl: item.image_url,
            collectionId: item.collection_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          })) || []
        }
      })
    )

    // Also get mood board items without collections (legacy support)
    const { data: uncategorizedItems, error: uncategorizedError } = await supabase
      .from('mood_board')
      .select('*')
      .eq('user_id', userId)
      .is('collection_id', null)
      .order('position', { ascending: true })

    if (uncategorizedError) {
      console.error('Error fetching uncategorized items:', uncategorizedError)
      return NextResponse.json({ error: 'Failed to fetch uncategorized items' }, { status: 500 })
    }

    const transformedUncategorizedItems = (uncategorizedItems || []).map(item => ({
      ...item,
      userId: item.user_id,
      imageUrl: item.image_url,
      collectionId: item.collection_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }))

    return NextResponse.json({ 
      collections: collectionsWithItems,
      uncategorizedItems: transformedUncategorizedItems
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

    const { data: newItem, error } = await supabase
      .from('mood_board')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        caption: caption || '',
        position: position || 0,
        collection_id: collectionId || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating mood board item:', error)
      return NextResponse.json({ error: 'Failed to create mood board item' }, { status: 500 })
    }

    const transformedItem = {
      ...newItem,
      userId: newItem.user_id,
      imageUrl: newItem.image_url,
      collectionId: newItem.collection_id,
      createdAt: newItem.created_at,
      updatedAt: newItem.updated_at
    }

    return NextResponse.json({ success: true, item: transformedItem })
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
      const { error } = await supabase
        .from('mood_board')
        .update({ caption })
        .eq('id', itemId)

      if (error) {
        console.error('Error updating mood board item caption:', error)
        return NextResponse.json({ error: 'Failed to update mood board item' }, { status: 500 })
      }
      
      return NextResponse.json({ success: true })
    }

    // Handle bulk update (for backward compatibility)
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        const { error } = await supabase
          .from('mood_board')
          .update({ 
            position: i,
            caption: items[i].caption || ''
          })
          .eq('id', items[i].id)

        if (error) {
          console.error('Error updating mood board item:', error)
          return NextResponse.json({ error: 'Failed to update mood board item' }, { status: 500 })
        }
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

    const { error } = await supabase
      .from('mood_board')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Error deleting mood board item:', error)
      return NextResponse.json({ error: 'Failed to delete mood board item' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting mood board item:', error)
    return NextResponse.json({ error: 'Failed to delete mood board item' }, { status: 500 })
  }
}
