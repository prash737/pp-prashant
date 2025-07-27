
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: institutionId } = await params

    console.log('🏛️ Fetching public institution profile for ID:', institutionId)

    // Get institution profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { 
        id: institutionId,
        role: 'institution'
      },
      include: {
        institution: {
          include: {
            institutionProfile: true
          }
        }
      }
    })

    if (!profile || !profile.institution) {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    console.log('✅ Institution profile found:', profile.institution.institutionName)

    // Fetch gallery images for this institution
    const galleryImages = await prisma.institutionGallery.findMany({
      where: { institutionId: institutionId },
      orderBy: { createdAt: 'desc' }
    })

    // Transform data to match the expected format
    const institutionProfile = profile.institution?.institutionProfile;
    const institutionData = {
      id: profile.id,
      name: institutionProfile?.institutionName || profile.firstName + ' ' + profile.lastName,
      type: institutionProfile?.institutionType || 'Unknown',
      category: institutionProfile?.category || '',
      location: profile.location || '',
      bio: profile.bio || '',
      logo: profile.profileImageUrl || '/images/pathpiper-logo.png',
      coverImage: institutionProfile?.coverImageUrl || '',
      website: institutionProfile?.website || '',
      verified: institutionProfile?.verified || false,
      founded: institutionProfile?.founded || null,
      tagline: institutionProfile?.tagline || '',
      overview: institutionProfile?.overview || '',
      gallery: galleryImages.map(img => ({
        id: img.id,
        url: img.imageUrl,
        caption: img.caption || ''
      }))
    }

    return NextResponse.json(institutionData)

  } catch (error) {
    console.error('Public institution profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}
