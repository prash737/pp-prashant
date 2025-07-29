
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ academicCommunities: [] });
    }

    const academicCommunities = await prisma.academicCommunity.findMany({
      where: { createdById: institutionId },
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ academicCommunities });

  } catch (error) {
    console.error('Public institution academic communities fetch error:', error);
    return NextResponse.json({ academicCommunities: [] });
  }
}
