
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;

    // Get circles without authentication (only public circle info)
    const circleBadges = await prisma.circleBadge.findMany({
      where: { 
        userId: studentId,
        isActive: true
      },
      include: {
        circle: {
          select: {
            id: true,
            name: true,
            color: true,
            imageUrl: true,
            description: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    const circles = circleBadges.map(badge => ({
      id: badge.circle.id,
      name: badge.circle.name,
      color: badge.circle.color,
      imageUrl: badge.circle.imageUrl,
      description: badge.circle.description,
      joinedAt: badge.joinedAt
    }));

    return NextResponse.json({ circles });

  } catch (error) {
    console.error('Public student circles fetch error:', error);
    return NextResponse.json({ circles: [] });
  }
}
