import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user from request (matches pattern from working endpoints)
async function getUserFromRequest(request: NextRequest) {
  const cookieStore = await cookies();

  // Get all cookies and log them for debugging
  const allCookies = cookieStore.getAll();
  console.log(
    "🍪 Available cookies:",
    allCookies.map((c) => c.name).join(", "),
  );

  // Try different cookie names that might contain the auth token
  const possibleTokens = [
    cookieStore.get("sb-access-token")?.value,
    cookieStore.get("supabase-access-token")?.value,
    cookieStore.get("auth-token")?.value,
    cookieStore.get("supabase.auth.token")?.value,
  ].filter(Boolean);

  if (possibleTokens.length === 0) {
    console.log("❌ No authentication tokens found");
    return null;
  }

  // Try each token until one works
  for (const token of possibleTokens) {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (!error && user) {
        console.log("✅ Auth successful with user:", user.id);
        return user;
      }
    } catch (e) {
      console.log("🔍 Token failed:", e);
      continue;
    }
  }

  console.log("❌ All tokens failed authentication");
  return null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;
    const { content, imageUrl } = await request.json();
    const cookieStore = await cookies();

    // Get authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Check if the parent post exists
    const parentPost = await prisma.feedPost.findFirst({
      where: {
        id: postId,
        isTrail: false,
      },
    });

    if (!parentPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get the current max trail order for this post
    const maxTrailOrder = await prisma.feedPost.aggregate({
      where: {
        parentPostId: postId,
        isTrail: true,
      },
      _max: {
        trailOrder: true,
      },
    });

    const nextTrailOrder = (maxTrailOrder._max.trailOrder || 0) + 1;

    // Create the trail
    const trail = await prisma.feedPost.create({
      data: {
        userId: user.id,
        content: content.trim(),
        imageUrl: imageUrl || null,
        isTrail: true,
        parentPostId: postId,
        trailOrder: nextTrailOrder,
        postType: "GENERAL",
        moderationStatus: "approved",
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
      },
    });

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
        commentsCount: trail.commentsCount || 0,
      },
    });
  } catch (error) {
    console.error("Error creating trail:", error);
    return NextResponse.json(
      { error: "Failed to create trail" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: postId } = await params;

    console.log("📋 Fetching trails for post:", postId);

    // Check if post exists first
    const parentPost = await prisma.feedPost.findUnique({
      where: { id: postId },
    });

    if (!parentPost) {
      console.log("❌ Parent post not found:", postId);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const trails = await prisma.feedPost.findMany({
      where: {
        parentPostId: postId,
        isTrail: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImageUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        trailOrder: "asc",
      },
    });

    console.log("✅ Found", trails.length, "trails for post:", postId);

    // Transform trails to include like counts
    const transformedTrails = trails.map((trail) => ({
      ...trail,
      likesCount: trail._count?.likes || 0,
      commentsCount: trail._count?.comments || 0,
      _count: undefined, // Remove the _count object from response
    }));

    return NextResponse.json({ trails: transformedTrails });
  } catch (error) {
    console.error("Error fetching trails:", error);
    return NextResponse.json(
      { error: "Failed to fetch trails" },
      { status: 500 },
    );
  }
}
