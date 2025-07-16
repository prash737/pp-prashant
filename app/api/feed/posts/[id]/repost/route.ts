
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { content } = await request.json()

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

    // Verify original post exists
    const originalPost = await prisma.feedPost.findUnique({
      where: { id: postId }
    })

    if (!originalPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user already reposted this
    const existingRepost = await prisma.feedPost.findFirst({
      where: {
        userId: user.id,
        parentPostId: postId
      }
    })

    if (existingRepost) {
      return NextResponse.json({ error: 'You have already reposted this' }, { status: 400 })
    }

    // Get user's age group
    const userProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: { student: true }
    })

    const ageGroup = userProfile?.student?.age_group || 'young_adult'

    // Create repost
    const repost = await prisma.feedPost.create({
      data: {
        content: content || '',
        userId: user.id,
        parentPostId: postId,
        postType: 'GENERAL',
        ageGroup: ageGroup,
        moderationStatus: 'approved'
      }
    })

    // Update shares count on original post
    await prisma.feedPost.update({
      where: { id: postId },
      data: { 
        sharesCount: { increment: 1 },
        engagementScore: { increment: 2 }
      }
    })

    return NextResponse.json({ repost })
  } catch (error) {
    console.error('Error creating repost:', error)
    return NextResponse.json({ error: 'Failed to create repost' }, { status: 500 })
  }
}
