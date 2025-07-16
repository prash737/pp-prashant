
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Get user from cookies
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    // Find the post to delete
    const post = await prisma.feedPost.findUnique({
      where: { id: postId },
      include: {
        trails: {
          orderBy: { trailOrder: 'asc' }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user owns the post
    if (post.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized - You can only delete your own posts' }, { status: 403 })
    }

    if (post.isTrail) {
      // Deleting a trail message - reorder remaining trails
      const parentPostId = post.parentPostId
      const deletedTrailOrder = post.trailOrder

      // Delete the trail
      await prisma.feedPost.delete({
        where: { id: postId }
      })

      // Reorder remaining trails
      if (parentPostId && deletedTrailOrder) {
        await prisma.feedPost.updateMany({
          where: {
            parentPostId: parentPostId,
            isTrail: true,
            trailOrder: {
              gt: deletedTrailOrder
            }
          },
          data: {
            trailOrder: {
              decrement: 1
            }
          }
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Trail message deleted successfully',
        type: 'trail'
      })
    } else {
      // Deleting a main post - delete all associated trails first
      await prisma.feedPost.deleteMany({
        where: {
          parentPostId: postId,
          isTrail: true
        }
      })

      // Delete associated likes, comments, bookmarks
      await prisma.postLike.deleteMany({
        where: { postId: postId }
      })

      await prisma.postBookmark.deleteMany({
        where: { postId: postId }
      })

      // Delete the main post
      await prisma.feedPost.delete({
        where: { id: postId }
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Post and all associated trails deleted successfully',
        type: 'post'
      })
    }
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
