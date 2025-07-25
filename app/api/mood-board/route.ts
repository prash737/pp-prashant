
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

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const moodBoardItems = await prisma.moodBoard.findMany({
      where: { userId },
      orderBy: { position: 'asc' }
    })

    return NextResponse.json({ moodBoard: moodBoardItems })
  } catch (error) {
    console.error('Error fetching mood board:', error)
    return NextResponse.json({ error: 'Failed to fetch mood board' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, imageUrl, caption, position } = await request.json()

    if (!userId || !imageUrl) {
      return NextResponse.json({ error: 'User ID and image URL are required' }, { status: 400 })
    }

    const newItem = await prisma.moodBoard.create({
      data: {
        userId,
        imageUrl,
        caption: caption || '',
        position: position || 0
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
    const { items } = await request.json()

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 })
    }

    // Update positions for all items
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
