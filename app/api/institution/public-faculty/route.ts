import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    if (!institutionId) {
      return NextResponse.json({ faculty: [] });
    }

    const faculty = await prisma.institutionFaculty.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ faculty });

  } catch (error) {
    console.error("Public institution faculty fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch faculty" },
      { status: 500 }
    );
  }
}