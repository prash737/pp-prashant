
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ gallery: [] });
    }

    const institution = await prisma.institution.findUnique({
      where: { profileId: institutionId },
      select: { gallery: true }
    });

    return NextResponse.json({ 
      gallery: institution?.gallery || [] 
    });

  } catch (error) {
    console.error('Public institution gallery fetch error:', error);
    return NextResponse.json({ gallery: [] });
  }
}
