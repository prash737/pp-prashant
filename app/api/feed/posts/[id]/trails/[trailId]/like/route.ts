import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trailId: string }> },
) {
  try {
    const { id: postId, trailId } = await params;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid authentication" },
        { status: 401 },
      );
    }

    // Verify trail exists
    const trail = await prisma.feedPost.findUnique({
      where: { id: trailId, isTrail: true },
    });

    if (!trail) {
      return NextResponse.json({ error: "Trail not found" }, { status: 404 });
    }

    // Check if user already liked this trail
    const existingLike = await prisma.postLike.findFirst({
      where: {
        userId: user.id,
        postId: trailId,
      },
    });

    let liked = false;

    if (existingLike) {
      // Unlike the trail
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement likes count
      await prisma.feedPost.update({
        where: { id: trailId },
        data: {
          likesCount: { decrement: 1 },
          engagementScore: { decrement: 1 },
        },
      });

      liked = false;
    } else {
      // Use upsert to handle potential race conditions
      await prisma.postLike.upsert({
        where: {
          userId_postId: {
            userId: user.id,
            postId: trailId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          postId: trailId,
        },
      });

      // Increment likes count
      await prisma.feedPost.update({
        where: { id: trailId },
        data: {
          likesCount: { increment: 1 },
          engagementScore: { increment: 1 },
        },
      });

      liked = true;
    }

    return NextResponse.json({ success: true, liked });
  } catch (error) {
    console.error("Error handling trail like:", error);
    return NextResponse.json(
      { error: "Failed to handle like" },
      { status: 500 },
    );
  }
}
