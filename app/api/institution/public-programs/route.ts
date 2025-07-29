import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    if (!institutionId) {
      return NextResponse.json({ programs: [] });
    }

    const programs = await prisma.institutionPrograms.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ programs });

  } catch (error) {
    console.error("Public institution programs fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}