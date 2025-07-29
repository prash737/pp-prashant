
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ followers: [] });
    }

    const followers = await prisma.institutionFollowConnection.findMany({
      where: { receiverId: institutionId },
      select: { id: true }
    });

    return NextResponse.json({ followers });

  } catch (error) {
    console.error('Public institution followers fetch error:', error);
    return NextResponse.json({ followers: [] });
  }
}
