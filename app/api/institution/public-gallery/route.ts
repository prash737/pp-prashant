
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json({ gallery: [] });
    }

    // Get gallery images for this institution
    const gallery = await prisma.institutionGallery.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      gallery: gallery.map(img => ({
        id: img.id,
        url: img.imageUrl,
        caption: img.caption || ''
      }))
    });

  } catch (error) {
    console.error('Public institution gallery fetch error:', error);
    return NextResponse.json({ gallery: [] });
  }
}
