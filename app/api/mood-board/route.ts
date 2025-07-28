
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const isPublicView = searchParams.get('isPublicView') === 'true'

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Build where clause for collections based on public view
    const collectionsWhere: any = { userId }
    
    // Only filter private collections if it's a public view (not the user's own profile)
    if (isPublicView) {
      collectionsWhere.AND = [
        { userId },
        {
          OR: [
            { isPrivate: false },
            { isPrivate: null }
          ]
        }
      ]
    }

    // Get collections with their mood board items
    const collections = await prisma.userCollection.findMany({
      where: collectionsWhere,
      include: {
        moodBoard: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Also get mood board items without collections (legacy support)
    const uncategorizedItems = await prisma.moodBoard.findMany({
      where: { 
        userId,
        collectionId: null
      },
      orderBy: { position: 'asc' }
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

    const newItem = await prisma.moodBoard.create({
      data: {
        userId,
        imageUrl,
        caption: caption || '',
        position: position || 0,
        collectionId: collectionId || null
      }
    })

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
      await prisma.moodBoard.update({
        where: { id: itemId },
        data: { caption }
      })
      return NextResponse.json({ success: true })
    }

    // Handle bulk update (for backward compatibility)
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        await prisma.moodBoard.update({
          where: { id: items[i].id },
          data: { 
            position: i,
            caption: items[i].caption || ''
          }
        })
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

    await prisma.moodBoard.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting mood board item:', error)
    return NextResponse.json({ error: 'Failed to delete mood board item' }, { status: 500 })
  }
}
