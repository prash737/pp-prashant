
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ facilities: [] });
    }

    const facilities = await prisma.institutionFacility.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ facilities });

  } catch (error) {
    console.error('Public institution facilities fetch error:', error);
    return NextResponse.json({ facilities: [] });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    if (!institutionId) {
      return NextResponse.json({ facilities: [] });
    }

    const facilities = await prisma.institutionFacilities.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ facilities });

  } catch (error) {
    console.error("Public institution facilities fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}
