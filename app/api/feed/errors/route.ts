
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const errors: any[] = [];
    
    console.log("🔍 Starting comprehensive error collection...");
    
    // Check 1: Posts without authors
    try {
      const postsWithoutAuthors = await prisma.$queryRaw`
        SELECT fp.id, fp.user_id, fp.content, fp.created_at
        FROM public.feed_posts fp
        LEFT JOIN public.profiles p ON fp.user_id = p.id
        WHERE p.id IS NULL
        LIMIT 10
      `;
      
      if (Array.isArray(postsWithoutAuthors) && postsWithoutAuthors.length > 0) {
        errors.push({
          type: "ORPHANED_POSTS",
          count: postsWithoutAuthors.length,
          description: "Posts without corresponding user profiles",
          samples: postsWithoutAuthors.slice(0, 3)
        });
      }
    } catch (error) {
      errors.push({
        type: "QUERY_ERROR",
        description: "Failed to check for orphaned posts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check 2: Empty content posts
    try {
      const emptyContentPosts = await prisma.feedPost.findMany({
        where: {
          content: ""
        },
        select: {
          id: true,
          userId: true,
          createdAt: true
        },
        take: 5
      });
      
      if (emptyContentPosts.length > 0) {
        errors.push({
          type: "EMPTY_CONTENT",
          count: emptyContentPosts.length,
          description: "Posts with empty content",
          samples: emptyContentPosts
        });
      }
    } catch (error) {
      errors.push({
        type: "QUERY_ERROR",
        description: "Failed to check for empty content posts",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check 3: Posts with invalid moderation status
    try {
      const invalidModerationPosts = await prisma.feedPost.findMany({
        where: {
          moderationStatus: {
            notIn: ["approved", "pending_review", "rejected", "flagged"]
          }
        },
        select: {
          id: true,
          moderationStatus: true,
          createdAt: true
        },
        take: 5
      });
      
      if (invalidModerationPosts.length > 0) {
        errors.push({
          type: "INVALID_MODERATION_STATUS",
          count: invalidModerationPosts.length,
          description: "Posts with invalid moderation status",
          samples: invalidModerationPosts
        });
      }
    } catch (error) {
      errors.push({
        type: "QUERY_ERROR",
        description: "Failed to check moderation status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check 4: Trails without parent posts
    try {
      const orphanedTrails = await prisma.$queryRaw`
        SELECT fp.id, fp.parent_post_id, fp.trail_order, fp.created_at
        FROM public.feed_posts fp
        LEFT JOIN public.feed_posts parent ON fp.parent_post_id = parent.id
        WHERE fp.is_trail = true AND parent.id IS NULL
        LIMIT 5
      `;
      
      if (Array.isArray(orphanedTrails) && orphanedTrails.length > 0) {
        errors.push({
          type: "ORPHANED_TRAILS",
          count: orphanedTrails.length,
          description: "Trail posts without parent posts",
          samples: orphanedTrails
        });
      }
    } catch (error) {
      errors.push({
        type: "QUERY_ERROR",
        description: "Failed to check for orphaned trails",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Check 5: Database connection health
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      errors.push({
        type: "DATABASE_CONNECTION",
        description: "Database connection failed",
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    console.log(`📊 Error collection complete. Found ${errors.length} error types.`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      totalErrorTypes: errors.length,
      errors: errors,
      status: errors.length === 0 ? "healthy" : "issues_detected"
    });
    
  } catch (error) {
    console.error("❌ Error collection failed:", error);
    return NextResponse.json(
      { 
        error: "Failed to collect errors",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
