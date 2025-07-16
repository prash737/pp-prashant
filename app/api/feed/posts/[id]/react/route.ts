import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const VALID_REACTION_TYPES = ['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'celebrate', 'think']

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const { reactionType } = await request.json()

    if (!reactionType || !VALID_REACTION_TYPES.includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 })
    }

    // Check if post exists
    const post = await prisma.feedPost.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Try to use post_reactions table first, fallback to post_likes
    try {
      // Check if user already reacted to this post
      const existingReaction = await prisma.$queryRaw`
        SELECT * FROM post_reactions 
        WHERE user_id = ${user.id} AND post_id = ${postId}
        LIMIT 1
      ` as any[]

      if (existingReaction.length > 0) {
        const reaction = existingReaction[0]

        if (reaction.reaction_type === reactionType) {
          // Remove reaction if same type
          await prisma.$executeRaw`
            DELETE FROM post_reactions 
            WHERE user_id = ${user.id} AND post_id = ${postId}
          `

          // Decrement engagement score
          await prisma.feedPost.update({
            where: { id: postId },
            data: { engagementScore: { decrement: 1 } }
          })

          return NextResponse.json({ 
            success: true, 
            reactionType: null, 
            message: 'Reaction removed' 
          })
        } else {
          // Update existing reaction to new type
          await prisma.$executeRaw`
            UPDATE post_reactions 
            SET reaction_type = ${reactionType}, updated_at = NOW()
            WHERE user_id = ${user.id} AND post_id = ${postId}
          `

          return NextResponse.json({ 
            success: true, 
            reactionType, 
            message: 'Reaction updated' 
          })
        }
      } else {
        // Create new reaction
        await prisma.$executeRaw`
          INSERT INTO post_reactions (user_id, post_id, reaction_type)
          VALUES (${user.id}, ${postId}, ${reactionType})
        `

        // Increment engagement score
        await prisma.feedPost.update({
          where: { id: postId },
          data: { engagementScore: { increment: 1 } }
        })

        return NextResponse.json({ 
          success: true, 
          reactionType, 
          message: 'Reaction added' 
        })
      }
    } catch (error) {
      console.error('post_reactions table not available, falling back to likes:', error)

      // Fallback to simple like functionality
      if (reactionType === 'like') {
        try {
          const existingLike = await prisma.postLike.findFirst({
            where: { userId: user.id, postId }
          })

          if (existingLike) {
            await prisma.postLike.delete({
              where: { id: existingLike.id }
            })

            await prisma.feedPost.update({
              where: { id: postId },
              data: { likesCount: { decrement: 1 } }
            })

            // Get updated like count
            const updatedPost = await prisma.feedPost.findUnique({
              where: { id: postId },
              select: { likesCount: true }
            })

            return NextResponse.json({ 
              success: true, 
              reactionType: null, 
              liked: false,
              likeCount: updatedPost?.likesCount || 0
            })
          } else {
            await prisma.postLike.create({
              data: { userId: user.id, postId }
            })

            const updatedPost = await prisma.feedPost.update({
              where: { id: postId },
              data: { 
                likesCount: { increment: 1 },
                engagementScore: { increment: 1 }
              },
              select: { likesCount: true }
            })

            return NextResponse.json({ 
              success: true, 
              reactionType: 'like', 
              liked: true,
              likeCount: updatedPost.likesCount
            })
          }
        } catch (fallbackError) {
          console.error('Fallback like operation failed:', fallbackError)
          return NextResponse.json({ 
            success: false, 
            error: 'Failed to process reaction' 
          }, { status: 500 })
        }
      } else {
        return NextResponse.json({ 
          error: 'Enhanced reactions not available. Only likes are supported.' 
        }, { status: 400 })
      }
    }
  } catch (error) {
    console.error('Error handling reaction:', error)
    return NextResponse.json({ error: 'Failed to handle reaction' }, { status: 500 })
  }
}

// Get reactions for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // Try to get reactions from enhanced table
    try {
      const reactions = await prisma.$queryRaw`
        SELECT reaction_type, COUNT(*) as count
        FROM post_reactions 
        WHERE post_id = ${postId}
        GROUP BY reaction_type
      ` as { reaction_type: string; count: bigint }[]

      const reactionCounts = reactions.reduce((acc, reaction) => {
        acc[reaction.reaction_type] = Number(reaction.count)
        return acc
      }, {} as Record<string, number>)

      return NextResponse.json({ reactionCounts })
    } catch (error) {
      // Fallback to likes only
      const post = await prisma.feedPost.findUnique({
        where: { id: postId },
        select: { likesCount: true }
      })

      return NextResponse.json({ 
        reactionCounts: { 
          like: post?.likesCount || 0 
        } 
      })
    }
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}