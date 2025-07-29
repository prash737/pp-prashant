
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    // Get goals without authentication
    const goals = await prisma.goal.findMany({
      where: { userId: studentId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ goals });

  } catch (error) {
    console.error('Public student goals fetch error:', error);
    return NextResponse.json({ goals: [] });
  }
}
