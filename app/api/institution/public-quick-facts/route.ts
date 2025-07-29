
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ quickFacts: null });
    }

    const quickFacts = await prisma.institutionQuickFacts.findUnique({
      where: { institutionId }
    });

    return NextResponse.json({ quickFacts });

  } catch (error) {
    console.error('Public institution quick facts fetch error:', error);
    return NextResponse.json({ quickFacts: null });
  }
}
