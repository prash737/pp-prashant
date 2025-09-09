
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: collections, error: collectionsError } = await supabase
      .from('user_collections')
      .select(`
        id,
        user_id,
        name,
        description,
        is_private,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

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
          console.error('Error fetching mood board items for collection:', itemsError)
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

    return NextResponse.json({ collections: collectionsWithItems })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 })
    }

    const { data: newCollection, error: insertError } = await supabase
      .from('user_collections')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating collection:', insertError)
      return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
    }

    // Get mood board items for the new collection (will be empty)
    const { data: items } = await supabase
      .from('mood_board')
      .select('*')
      .eq('collection_id', newCollection.id)
      .order('position', { ascending: true })

    const collectionWithItems = {
      ...newCollection,
      userId: newCollection.user_id,
      isPrivate: newCollection.is_private,
      createdAt: newCollection.created_at,
      moodBoard: items?.map(item => ({
        ...item,
        userId: item.user_id,
        imageUrl: item.image_url,
        collectionId: item.collection_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || []
    }

    return NextResponse.json({ success: true, collection: collectionWithItems })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collectionId')

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
    }

    // Verify ownership
    const { data: collection, error: ownershipError } = await supabase
      .from('user_collections')
      .select('id, user_id')
      .eq('id', parseInt(collectionId))
      .eq('user_id', user.id)
      .single()

    if (ownershipError || !collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // First delete all mood board items associated with this collection
    const { error: deleteItemsError } = await supabase
      .from('mood_board')
      .delete()
      .eq('collection_id', parseInt(collectionId))

    if (deleteItemsError) {
      console.error('Error deleting mood board items:', deleteItemsError)
      return NextResponse.json({ error: 'Failed to delete collection items' }, { status: 500 })
    }

    // Then delete the collection itself
    const { error: deleteCollectionError } = await supabase
      .from('user_collections')
      .delete()
      .eq('id', parseInt(collectionId))

    if (deleteCollectionError) {
      console.error('Error deleting collection:', deleteCollectionError)
      return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json({ error: 'Failed to delete collection' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { collectionId, isPrivate } = await request.json()

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 })
    }

    // Update collection privacy
    const { data: updatedCollection, error: updateError } = await supabase
      .from('user_collections')
      .update({ is_private: isPrivate })
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating collection privacy:', updateError)
      return NextResponse.json({ error: 'Failed to update collection privacy' }, { status: 500 })
    }

    const transformedCollection = {
      ...updatedCollection,
      userId: updatedCollection.user_id,
      isPrivate: updatedCollection.is_private,
      createdAt: updatedCollection.created_at
    }

    return NextResponse.json({ success: true, collection: transformedCollection })
  } catch (error) {
    console.error('Error updating collection privacy:', error)
    return NextResponse.json({ error: 'Failed to update collection privacy' }, { status: 500 })
  }
}
