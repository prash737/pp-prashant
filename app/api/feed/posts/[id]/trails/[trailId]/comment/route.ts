
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; trailId: string } }
) {
  try {
    const trailId = params.trailId
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Get user from cookies
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    // Verify trail exists
    const trail = await prisma.feedPost.findUnique({
      where: { id: trailId, isTrail: true }
    })

    if (!trail) {
      return NextResponse.json({ error: 'Trail not found' }, { status: 404 })
    }

    // Create comment
    const comment = await prisma.postComment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        postId: trailId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      }
    })

    // Update comments count
    await prisma.feedPost.update({
      where: { id: trailId },
      data: { 
        commentsCount: { increment: 1 },
        engagementScore: { increment: 1 }
      }
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error('Error creating trail comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; trailId: string } }
) {
  try {
    const trailId = params.trailId

    const comments = await prisma.postComment.findMany({
      where: { postId: trailId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching trail comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
