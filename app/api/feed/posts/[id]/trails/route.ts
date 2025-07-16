import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { content, imageUrl } = await request.json()
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid authentication" }, { status: 401 })
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Check if the parent post exists
    const parentPost = await prisma.feedPost.findFirst({
      where: {
        id: postId,
        isTrail: false
      }
    })

    if (!parentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Get the current max trail order for this post
    const maxTrailOrder = await prisma.feedPost.aggregate({
      where: {
        parentPostId: postId,
        isTrail: true
      },
      _max: {
        trailOrder: true
      }
    })

    const nextTrailOrder = (maxTrailOrder._max.trailOrder || 0) + 1

    // Create the trail
    const trail = await prisma.feedPost.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        isTrail: true,
        parentPostId: postId,
        trailOrder: nextTrailOrder,
        postType: 'GENERAL',
        moderationStatus: 'approved'
      },
      include: {
        author: {
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

    return NextResponse.json({
      success: true,
      trail: {
        id: trail.id,
        content: trail.content,
        imageUrl: trail.imageUrl,
        trailOrder: trail.trailOrder,
        createdAt: trail.createdAt,
        author: trail.author,
        likesCount: trail.likesCount || 0,
        commentsCount: trail.commentsCount || 0
      }
    })
  } catch (error) {
    console.error('Error creating trail:', error)
    return NextResponse.json({ error: "Failed to create trail" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // Check if post exists first
    const parentPost = await prisma.feedPost.findUnique({
      where: { id: postId }
    })

    if (!parentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const trails = await prisma.feedPost.findMany({
      where: {
        parentPostId: postId,
        isTrail: true
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImageUrl: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        }
      },
      orderBy: {
        trailOrder: 'asc'
      }
    })

    // Transform trails to include like counts and user like status
    const transformedTrails = trails.map(trail => ({
      ...trail,
      likesCount: trail.likes?.length || 0,
      likes: undefined // Remove the likes array from response for cleaner data
    }))

    return NextResponse.json({ trails: transformedTrails })
  } catch (error) {
    console.error('Error fetching trails:', error)
    return NextResponse.json({ error: "Failed to fetch trails" }, { status: 500 })
  }
}