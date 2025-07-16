import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Function to calculate engagement score
function calculateEngagementScore(likes: number, comments: number, shares: number, views: number): number {
  const likeWeight = 1
  const commentWeight = 2
  const shareWeight = 3
  const viewWeight = 0.1

  return (likes * likeWeight + comments * commentWeight + shares * shareWeight + views * viewWeight)
}

// Function to determine age group from user data
async function getUserAgeGroup(userId: string): Promise<string | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { student: true }
    })

    if (profile?.student?.birthYear && profile?.student?.birthMonth) {
      const currentYear = new Date().getFullYear()
      const birthYear = parseInt(profile.student.birthYear)
      const age = currentYear - birthYear

      if (age < 13) return "elementary"
      if (age < 16) return "middle_school"
      if (age < 18) return "high_school"
      return "young_adult"
    }

    return "young_adult" // Default
  } catch {
    return "young_adult"
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      content, 
      imageUrl, 
      parentPostId, 
      isTrail = false,
      postType = "GENERAL",
      tags = [],
      subjects = [],
      achievementType,
      projectCategory,
      difficultyLevel,
      isQuestion = false,
      isAchievement = false,
      forceTrail = false,
      linkPreview
    } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // For non-trail posts, enforce character limit strictly (287 chars as per frontend)
    if (content.length > 287 && !isTrail && !forceTrail) {
      return NextResponse.json(
        { 
          error: "Content exceeds 287 characters. Please use 'Start Trail' to share longer content.",
          suggestTrail: true
        },
        { status: 400 }
      )
    }

    // Get user's age group for content targeting
    const ageGroup = await getUserAgeGroup(user.id)

    // If it's a trail, get the next trail order
    let trailOrder = null
    if (isTrail && parentPostId) {
      // Verify parent post exists
      const parentPost = await prisma.feedPost.findUnique({
        where: { id: parentPostId }
      })

      if (!parentPost) {
        return NextResponse.json({ error: 'Parent post not found' }, { status: 404 })
      }

      // Get the highest trail order for this parent post
      const lastTrail = await prisma.feedPost.findFirst({
        where: { 
          parentPostId,
          isTrail: true 
        },
        orderBy: { trailOrder: 'desc' }
      })

      // Set trail order (starting from 1 for first trail)
      trailOrder = (lastTrail?.trailOrder || 0) + 1

      console.log(`📝 Creating trail ${trailOrder} for parent post ${parentPostId}`)
    }

    // Content moderation - simple keyword filtering
    const moderationStatus = await moderateContent(content)

    const post = await prisma.feedPost.create({
      data: {
        userId: user.id,
        content,
        imageUrl: imageUrl || null,
        isTrail,
        parentPostId,
        trailOrder,
        postType: postType as any,
        tags,
        subjects,
        ageGroup,
        difficultyLevel,
        isQuestion,
        isAchievement,
        achievementType: isAchievement ? achievementType : null,
        projectCategory: postType === "PROJECT" ? projectCategory : null,
        moderationStatus,
        engagementScore: 0
      },
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

    // Update engagement score based on post type and content
    let initialEngagementBoost = 0
    if (postType === "ACHIEVEMENT") initialEngagementBoost = 5
    if (postType === "PROJECT") initialEngagementBoost = 3
    if (postType === "QUESTION") initialEngagementBoost = 2

    if (initialEngagementBoost > 0) {
      await prisma.feedPost.update({
        where: { id: post.id },
        data: { engagementScore: initialEngagementBoost }
      })
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const postType = searchParams.get('type')
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause based on filters
    const whereClause: any = { 
      isTrail: false,
      moderationStatus: 'approved'
    }

    if (postType && postType !== 'all') {
      whereClause.postType = postType
    }

    if (subject) {
      whereClause.subjects = {
        has: subject
      }
    }

    if (difficulty) {
      whereClause.difficultyLevel = difficulty
    }

    // Additional filtering based on filter type
    if (filter === 'achievements') {
      whereClause.isAchievement = true
    } else if (filter === 'projects') {
      whereClause.postType = 'PROJECT'
    } else if (filter === 'questions') {
      whereClause.isQuestion = true
    }

    // Order by engagement score and recency
    const orderBy = filter === 'trending' 
      ? [{ engagementScore: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }]

    // Get current user's likes
    let userLikes: string[] = []
    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      if (user) {
        const likes = await prisma.postLike.findMany({
          where: { userId: user.id },
          select: { postId: true }
        })
        userLikes = likes.map(like => like.postId)
      }
    }


    const posts = await prisma.feedPost.findMany({
      where: whereClause,
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
        parentPost: {
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
        },
        trails: {
          where: { isTrail: true },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          },
          orderBy: { trailOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: offset
    })

    // Add isLikedByUser field to each post
    const postsWithLikeStatus = posts.map(post => ({
      ...post,
      isLikedByUser: userLikes.includes(post.id)
    }))

    // Update view counts for returned posts
    const postIds = posts.map(post => post.id)
    if (postIds.length > 0) {
      await prisma.feedPost.updateMany({
        where: { id: { in: postIds } },
        data: { viewsCount: { increment: 1 } }
      })
    }

    return NextResponse.json({ 
      posts: postsWithLikeStatus.map(post => ({
        ...post,
        tags: Array.isArray(post.tags) ? post.tags : [],
        subjects: Array.isArray(post.subjects) ? post.subjects : [],
        // Ensure consistent like data structure
        likesCount: post.likesCount || 0,
        _count: {
          ...post._count,
          likes: post.likesCount || 0
        }
      })),
      hasMore: false // Add pagination support if needed
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// Simple content moderation function
async function moderateContent(content: string): Promise<string> {
  const inappropriateWords = [
    'spam', 'fake', 'scam', 'cheat', 'hack', 'illegal'
    // Add more words as needed
  ]

  const lowerContent = content.toLowerCase()
  const hasInappropriateContent = inappropriateWords.some(word => 
    lowerContent.includes(word)
  )

  if (hasInappropriateContent) {
    return 'pending_review'
  }

  return 'approved'
}