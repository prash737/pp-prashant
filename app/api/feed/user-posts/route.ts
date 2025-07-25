import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's posts with detailed info
    const userPosts = await prisma.feedPost.findMany({
      where: {
        userId: user.id,
        isTrail: false,
      },
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
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log(`🔍 User posts debug for ${user.id}:`, {
      totalPosts: userPosts.length,
      posts: userPosts.map((p) => ({
        id: p.id.substring(0, 8),
        content: p.content?.substring(0, 50) + "...",
        status: p.moderationStatus,
        created: p.createdAt,
        hasAuthor: !!p.author,
      })),
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      userName:
        user.user_metadata?.first_name + " " + user.user_metadata?.last_name,
      posts: userPosts,
      summary: {
        total: userPosts.length,
        approved: userPosts.filter((p) => p.moderationStatus === "approved")
          .length,
        pending: userPosts.filter(
          (p) => p.moderationStatus === "pending_review",
        ).length,
        rejected: userPosts.filter((p) => p.moderationStatus === "rejected")
          .length,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching user posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 },
    );
  }
}
