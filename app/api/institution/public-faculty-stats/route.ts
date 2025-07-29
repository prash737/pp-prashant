
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ facultyStats: null });
    }

    const facultyStats = await prisma.institutionFacultyStats.findUnique({
      where: { institutionId }
    });

    return NextResponse.json({ facultyStats });

  } catch (error) {
    console.error('Public institution faculty stats fetch error:', error);
    return NextResponse.json({ facultyStats: null });
  }
}
