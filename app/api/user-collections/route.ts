
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/drizzle/client'
import { userCollections, moodBoard } from '@/lib/drizzle/schema'
import { eq, and, asc, desc } from 'drizzle-orm'

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

    const collections = await db
      .select({
        id: userCollections.id,
        userId: userCollections.userId,
        name: userCollections.name,
        description: userCollections.description,
        isPrivate: userCollections.isPrivate,
        createdAt: userCollections.createdAt
      })
      .from(userCollections)
      .where(eq(userCollections.userId, user.id))
      .orderBy(desc(userCollections.createdAt))

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

    const [newCollection] = await db
      .insert(userCollections)
      .values({
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null
      })
      .returning()

    // Get mood board items for the new collection (will be empty)
    const items = await db
      .select()
      .from(moodBoard)
      .where(eq(moodBoard.collectionId, newCollection.id))
      .orderBy(asc(moodBoard.position))

    const collectionWithItems = {
      ...newCollection,
      moodBoard: items
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
    const collection = await db
      .select({
        id: userCollections.id,
        userId: userCollections.userId
      })
      .from(userCollections)
      .where(
        and(
          eq(userCollections.id, parseInt(collectionId)),
          eq(userCollections.userId, user.id)
        )
      )
      .limit(1)

    if (collection.length === 0) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    // First delete all mood board items associated with this collection
    await db
      .delete(moodBoard)
      .where(eq(moodBoard.collectionId, parseInt(collectionId)))

    // Then delete the collection itself
    await db
      .delete(userCollections)
      .where(eq(userCollections.id, parseInt(collectionId)))

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
    const [updatedCollection] = await db
      .update(userCollections)
      .set({ isPrivate })
      .where(
        and(
          eq(userCollections.id, collectionId),
          eq(userCollections.userId, user.id)
        )
      )
      .returning()

    return NextResponse.json({ success: true, collection: updatedCollection })
  } catch (error) {
    console.error('Error updating collection privacy:', error)
    return NextResponse.json({ error: 'Failed to update collection privacy' }, { status: 500 })
  }
}
