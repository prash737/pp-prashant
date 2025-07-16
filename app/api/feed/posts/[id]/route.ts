
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 })
    }

    // Fetch the post with its trails and author information
    const post = await prisma.feedPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
            student: {
              select: {
                age_group: true
              }
            }
          }
        },
        trails: {
          orderBy: { trailOrder: 'asc' },
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Format the response
    const formattedPost = {
      ...post,
      tags: Array.isArray(post.tags) ? post.tags : [],
      subjects: Array.isArray(post.subjects) ? post.subjects : [],
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      bookmarksCount: post._count.bookmarks
    }

    return NextResponse.json({ success: true, post: formattedPost })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
