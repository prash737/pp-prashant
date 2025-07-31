import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Starting comprehensive feed display check...");

    // Test 1: Check total posts in database
    const totalPosts = await prisma.feedPost.count();
    console.log(`📊 Total posts in database: ${totalPosts}`);

    // Test 2: Check posts by moderation status
    const moderationStats = await prisma.feedPost.groupBy({
      by: ["moderationStatus"],
      _count: true,
    });
    console.log("📋 Posts by moderation status:", moderationStats);

    // Test 3: Check main posts vs trails
    const postTypeStats = await prisma.feedPost.groupBy({
      by: ["isTrail"],
      _count: true,
    });
    console.log("🔗 Main posts vs trails:", postTypeStats);

    // Test 4: Get sample of all posts (including problematic ones)
    const allPosts = await prisma.feedPost.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    // Test 5: Check what the feed API actually returns
    const feedApiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/posts`,
      {
        method: "GET",
      },
    );

    let feedApiData = null;
    if (feedApiResponse.ok) {
      feedApiData = await feedApiResponse.json();
    }

    // Test 6: Check for orphaned trails
    const orphanedTrails = await prisma.feedPost.findMany({
      where: {
        isTrail: true,
        parentPost: null,
      },
      take: 5,
    });

    // Test 7: Check for posts with missing authors
    // Use a raw query to find posts that reference non-existent users
    const postsWithMissingAuthors = await prisma.$queryRaw`
      SELECT fp.id, fp.user_id, fp.content
      FROM public.feed_posts fp
      LEFT JOIN public.profiles p ON fp.user_id = p.id
      WHERE p.id IS NULL
      LIMIT 5
    `;

    // Test 8: Check posts that should be visible but might not appear
    const approvedMainPosts = await prisma.feedPost.findMany({
      where: {
        isTrail: false,
        moderationStatus: "approved",
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        trails: {
          where: { moderationStatus: "approved" },
          take: 3,
          orderBy: { trailOrder: "asc" },
        },
      },
    });

    // Test 9: Check for posts with null or undefined fields that might break rendering
    const postsWithIssues = await prisma.$queryRaw`
      SELECT fp.id, fp.user_id, fp.content
      FROM public.feed_posts fp
      LEFT JOIN public.profiles p ON fp.user_id = p.id
      WHERE fp.content = '' OR p.id IS NULL
      LIMIT 5
    `;

    // Test 10: Check user authentication and permissions
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get("sb-access-token")?.value;
    let currentUser = null;

    if (accessToken) {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(accessToken);
      currentUser = user;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalPostsInDB: totalPosts,
        postsReturnedByAPI: feedApiData?.posts?.length || 0,
        moderationStatusBreakdown: moderationStats,
        mainPostsVsTrails: postTypeStats,
        orphanedTrails: orphanedTrails.length,
        postsWithMissingAuthors: (postsWithMissingAuthors as any).length,
        postsWithDataIssues: postsWithIssues.length,
        userAuthenticated: !!currentUser,
      },
      detailedResults: {
        sampleAllPosts: allPosts.map((post) => ({
          id: post.id.substring(0, 8),
          content: post.content.substring(0, 50) + "...",
          author: post.author
            ? `${post.author.firstName} ${post.author.lastName}`
            : "MISSING",
          moderationStatus: post.moderationStatus,
          isTrail: post.isTrail,
          createdAt: post.createdAt,
          hasValidData: !!(post.content && post.userId && post.author),
        })),
        feedApiResponse: {
          success: feedApiResponse.ok,
          status: feedApiResponse.status,
          postsCount: feedApiData?.posts?.length || 0,
          firstFewPosts:
            feedApiData?.posts?.slice(0, 3)?.map((post: any) => ({
              id: post.id?.substring(0, 8),
              hasContent: !!post.content,
              hasAuthor: !!post.author,
              moderationStatus: post.moderationStatus,
            })) || [],
        },
        approvedMainPosts: approvedMainPosts.map((post) => ({
          id: post.id.substring(0, 8),
          content: post.content.substring(0, 30) + "...",
          author: `${post.author.firstName} ${post.author.lastName}`,
          trailsCount: post.trails.length,
          createdAt: post.createdAt,
        })),
        problemsFound: {
          orphanedTrails: orphanedTrails.map((trail) => ({
            id: trail.id.substring(0, 8),
            parentPostId: trail.parentPostId,
            content: trail.content.substring(0, 30) + "...",
          })),
          postsWithMissingAuthors: (postsWithMissingAuthors as any).map(
            (post: any) => ({
              id: post.id.substring(0, 8),
              userId: post.user_id,
              content: post.content?.substring(0, 30) + "...",
            }),
          ),
          postsWithDataIssues: postsWithIssues.map((post) => ({
            id: post.id.substring(0, 8),
            issues: {
              noContent: !post.content || post.content === "",
              noUserId: !post.userId,
            },
          })),
        },
      },
      recommendations: [],
    });
  } catch (error) {
    console.error("❌ Feed debug check failed:", error);
    return NextResponse.json(
      {
        error: "Failed to debug feed display",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
