import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user from request
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trailId: string }> },
) {
  try {
    const { id: postId, trailId } = await params;

    // Check if the trail exists
    const trail = await prisma.feedPost.findFirst({
      where: {
        id: trailId,
        parentPostId: postId,
        isTrail: true,
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
          },
        },
      },
    });

    if (!trail) {
      return NextResponse.json({ error: "Trail not found" }, { status: 404 });
    }

    // Transform trail to include like counts
    const transformedTrail = {
      ...trail,
      likesCount: trail._count?.likes || 0,
      commentsCount: trail._count?.comments || 0,
      _count: undefined,
    };

    return NextResponse.json({ trail: transformedTrail });
  } catch (error) {
    console.error("Error fetching trail:", error);
    return NextResponse.json(
      { error: "Failed to fetch trail" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trailId: string }> },
) {
  try {
    const { id: postId, trailId } = await params;
    const { content, imageUrl } = await request.json();

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

    // Check if the trail exists and user owns it
    const existingTrail = await prisma.feedPost.findFirst({
      where: {
        id: trailId,
        parentPostId: postId,
        isTrail: true,
        userId: user.id,
      },
    });

    if (!existingTrail) {
      return NextResponse.json(
        { error: "Trail not found or unauthorized" },
        { status: 404 },
      );
    }

    // Update the trail
    const updatedTrail = await prisma.feedPost.update({
      where: { id: trailId },
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        updatedAt: new Date(),
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
        id: updatedTrail.id,
        content: updatedTrail.content,
        imageUrl: updatedTrail.imageUrl,
        trailOrder: updatedTrail.trailOrder,
        createdAt: updatedTrail.createdAt,
        updatedAt: updatedTrail.updatedAt,
        author: updatedTrail.author,
        likesCount: updatedTrail.likesCount || 0,
        commentsCount: updatedTrail.commentsCount || 0,
      },
    });
  } catch (error) {
    console.error("Error updating trail:", error);
    return NextResponse.json(
      { error: "Failed to update trail" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trailId: string }> },
) {
  try {
    const { id: postId, trailId } = await params;

    // Get authenticated user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check if the trail exists and user owns it
    const existingTrail = await prisma.feedPost.findFirst({
      where: {
        id: trailId,
        parentPostId: postId,
        isTrail: true,
        userId: user.id,
      },
    });

    if (!existingTrail) {
      return NextResponse.json(
        { error: "Trail not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the trail
    await prisma.feedPost.delete({
      where: { id: trailId },
    });

    return NextResponse.json({
      success: true,
      message: "Trail deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trail:", error);
    return NextResponse.json(
      { error: "Failed to delete trail" },
      { status: 500 },
    );
  }
}
