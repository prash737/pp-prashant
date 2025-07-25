import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    // Check if user is admin/moderator
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
    });

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }

    const { action, reason, suggestions } = await request.json();
    const itemId = params.id;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update the review queue item
    const updatedItem = await prisma.humanReviewQueue.update({
      where: { id: itemId },
      data: {
        reviewStatus: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date(),
        reviewerId: user.id,
        reviewerReason: reason,
        reviewerSuggestions: suggestions,
      },
    });

    // Log the human review decision
    await prisma.moderationLog.create({
      data: {
        userId: updatedItem.userId,
        contentType: updatedItem.contentType,
        content: updatedItem.content?.substring(0, 1000) || "",
        imageUrl: updatedItem.imageUrl,
        videoUrl: updatedItem.videoUrl,
        status: action === "approve" ? "approved" : "rejected",
        riskScore: updatedItem.riskScore,
        flags: updatedItem.flags,
        reason: `Human review: ${reason}`,
        requiresHumanReview: false,
        moderatedAt: new Date(),
        humanReviewerId: user.id,
      },
    });

    // If this was a post that was approved, update the post status
    if (action === "approve" && updatedItem.postId) {
      await prisma.feedPost.update({
        where: { id: updatedItem.postId },
        data: { moderationStatus: "approved" },
      });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("Error updating review item:", error);
    return NextResponse.json(
      { error: "Failed to update review item" },
      { status: 500 },
    );
  }
}
