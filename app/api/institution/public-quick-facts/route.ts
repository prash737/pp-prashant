import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ quickFacts: null });
    }

    // Get quick facts for this institution
    const institution = await prisma.institutionProfile.findUnique({
      where: { id: institutionId },
      select: {
        institutionName: true,
        institutionType: true,
        website: true,
        overview: true,
        mission: true,
        coreValues: true,
        verified: true,
        createdAt: true
      }
    });

    if (!institution) {
      return NextResponse.json({ quickFacts: {} });
    }

    // Get additional stats
    const [programCount, facultyCount, eventCount] = await Promise.all([
      prisma.institutionPrograms.count({ where: { institutionId } }),
      prisma.institutionFaculty.count({ where: { institutionId } }),
      prisma.institutionEvents.count({ where: { institutionId } })
    ]);

    return NextResponse.json({ 
      quickFacts: {
        name: institution.institutionName,
        type: institution.institutionType,
        website: institution.website,
        overview: institution.overview,
        mission: institution.mission,
        coreValues: institution.coreValues,
        verified: institution.verified,
        established: institution.createdAt,
        programCount,
        facultyCount,
        eventCount
      }
    });

  } catch (error) {
    console.error('Public institution quick facts fetch error:', error);
    return NextResponse.json({ quickFacts: null });
  }
}