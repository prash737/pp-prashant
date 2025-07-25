import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

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

    const today = new Date();
    const yesterdayStart = new Date(today);
    yesterdayStart.setDate(today.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);

    // Get pending review count
    const totalPending = await prisma.humanReviewQueue.count({
      where: { reviewStatus: "pending" },
    });

    // Get reviewed today count
    const totalReviewed = await prisma.humanReviewQueue.count({
      where: {
        reviewStatus: { in: ["approved", "rejected"] },
        reviewedAt: { gte: todayStart },
      },
    });

    // Get high risk items count
    const highRiskItems = await prisma.humanReviewQueue.count({
      where: {
        riskScore: { gte: 15 },
        reviewStatus: "pending",
      },
    });

    // Calculate average response time (in minutes)
    const reviewedItems = await prisma.humanReviewQueue.findMany({
      where: {
        reviewStatus: { in: ["approved", "rejected"] },
        reviewedAt: { not: null },
        queuedAt: { gte: yesterdayStart },
      },
      select: {
        queuedAt: true,
        reviewedAt: true,
      },
    });

    let avgResponseTime = 0;
    if (reviewedItems.length > 0) {
      const totalResponseTime = reviewedItems.reduce((sum, item) => {
        if (item.reviewedAt) {
          return sum + (item.reviewedAt.getTime() - item.queuedAt.getTime());
        }
        return sum;
      }, 0);
      avgResponseTime = Math.round(
        totalResponseTime / reviewedItems.length / (1000 * 60),
      ); // Convert to minutes
    }

    // Get top flags
    const flagCounts = await prisma.humanReviewQueue.groupBy({
      by: ["flags"],
      _count: {
        flags: true,
      },
      where: {
        queuedAt: { gte: yesterdayStart },
      },
    });

    const topFlags = flagCounts
      .flatMap((item) =>
        item.flags.map((flag) => ({ flag, count: item._count.flags })),
      )
      .reduce(
        (acc, { flag, count }) => {
          acc[flag] = (acc[flag] || 0) + count;
          return acc;
        },
        {} as Record<string, number>,
      );

    const topFlagsArray = Object.entries(topFlags)
      .map(([flag, count]) => ({ flag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalPending,
      totalReviewed,
      highRiskItems,
      avgResponseTime,
      topFlags: topFlagsArray,
    });
  } catch (error) {
    console.error("Error fetching moderation stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderation stats" },
      { status: 500 },
    );
  }
}
