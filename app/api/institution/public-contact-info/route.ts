
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ contactInfo: null });
    }

    const contactInfo = await prisma.institutionContactInfo.findUnique({
      where: { institutionId }
    });

    return NextResponse.json({ contactInfo });

  } catch (error) {
    console.error('Public institution contact info fetch error:', error);
    return NextResponse.json({ contactInfo: null });
  }
}
