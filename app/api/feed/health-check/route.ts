import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log("🏥 Starting feed health check...");

    // Check database connection
    const dbCheck = await prisma.$queryRaw`SELECT 1 as health`;
    console.log("✅ Database connection healthy");

    // Check feed posts table
    const totalPosts = await prisma.feedPost.count();
    console.log(`📊 Total posts in database: ${totalPosts}`);

    // Check moderation status distribution
    const moderationStats = await prisma.feedPost.groupBy({
      by: ["moderationStatus"],
      _count: true,
    });
    console.log("📋 Moderation status distribution:", moderationStats);

    // Check for problematic posts
    const postsWithoutAuthors = await prisma.feedPost.count({
      where: { author: null }
    });

    const emptyPosts = await prisma.feedPost.count({
      where: { 
        OR: [
          { content: "" },
          { content: null }
        ]
      }
    });

    // Check recent activity (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentPosts = await prisma.feedPost.count({
      where: {
        createdAt: {
          gte: yesterday
        }
      }
    });

    // Check API availability
    const apiChecks = {
      postsEndpoint: false,
      likeEndpoint: false,
      moderationEndpoint: false
    };

    try {
      const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/posts`);
      apiChecks.postsEndpoint = postsResponse.ok;
    } catch (error) {
      console.warn("Posts endpoint check failed:", error);
    }

    try {
      const moderationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: "test", type: "post" })
      });
      apiChecks.moderationEndpoint = moderationResponse.ok;
    } catch (error) {
      console.warn("Moderation endpoint check failed:", error);
    }

    // Check authentication
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get("sb-access-token")?.value;
    let authCheck = false;

    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      authCheck = !error && !!user;
    }

    const healthReport = {
      timestamp: new Date().toISOString(),
      overall: "healthy",
      database: {
        connected: true,
        totalPosts,
        recentPosts,
        moderationStats: moderationStats.reduce((acc: any, stat) => {
          acc[stat.moderationStatus] = stat._count;
          return acc;
        }, {}),
        issues: {
          postsWithoutAuthors,
          emptyPosts
        }
      },
      api: {
        endpoints: apiChecks,
        authentication: authCheck
      },
      recommendations: []
    };

    // Add recommendations based on findings
    if (postsWithoutAuthors > 0) {
      healthReport.recommendations.push(`Found ${postsWithoutAuthors} posts without authors - check user relationship integrity`);
    }

    if (emptyPosts > 0) {
      healthReport.recommendations.push(`Found ${emptyPosts} empty posts - consider cleanup`);
    }

    if (!apiChecks.postsEndpoint) {
      healthReport.recommendations.push("Posts API endpoint not responding");
      healthReport.overall = "degraded";
    }

    if (!apiChecks.moderationEndpoint) {
      healthReport.recommendations.push("Moderation API endpoint not responding - posts may not be filtered");
    }

    if (recentPosts === 0) {
      healthReport.recommendations.push("No recent posts in last 24 hours - check user engagement");
    }

    console.log("🏥 Health check completed:", healthReport);

    return NextResponse.json({
      success: true,
      health: healthReport
    });

  } catch (error) {
    console.error("❌ Feed health check failed:", error);
    return NextResponse.json({
      success: false,
      error: "Health check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}