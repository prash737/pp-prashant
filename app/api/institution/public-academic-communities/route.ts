import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    if (!institutionId) {
      return NextResponse.json({ communities: [] });
    }

    const communities = await prisma.academicCommunity.findMany({
      where: { institutionId },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ communities });

  } catch (error) {
    console.error("Public institution academic communities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch academic communities" },
      { status: 500 }
    );
  }
}