
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ events: [] });
    }

    const events = await prisma.institutionEvent.findMany({
      where: { institutionId },
      orderBy: { eventDate: 'desc' }
    });

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Public institution events fetch error:', error);
    return NextResponse.json({ events: [] });
  }
}
