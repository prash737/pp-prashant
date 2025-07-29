
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    // Get achievements without authentication
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: studentId },
      include: {
        achievementCategory: true,
        achievementType: true
      },
      orderBy: { dateEarned: 'desc' }
    });

    return NextResponse.json({ achievements });

  } catch (error) {
    console.error('Public student achievements fetch error:', error);
    return NextResponse.json({ achievements: [] });
  }
}
