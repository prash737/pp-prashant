import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ contactInfo: null });
    }

    // Get contact information for this institution
    const [institution, profile] = await Promise.all([
      prisma.institutionProfile.findUnique({
        where: { id: institutionId },
        select: {
          website: true,
          institutionName: true
        }
      }),
      prisma.profile.findUnique({
        where: { id: institutionId },
        select: {
          email: true,
          location: true,
          phone: true
        }
      })
    ]);

    return NextResponse.json({ 
      contactInfo: {
        name: institution?.institutionName,
        website: institution?.website,
        email: profile?.email,
        location: profile?.location,
        phone: profile?.phone
      }
    });

  } catch (error) {
    console.error('Public institution contact info fetch error:', error);
    return NextResponse.json({ contactInfo: null });
  }
}