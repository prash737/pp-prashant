
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
            institutionTypeRef: true,
            programs: true,
            events: true,
            gallery: true,
            facilities: true,
            faculty: true,
            quickFacts: true,
            contactInfo: true,
            facultyStats: true,
            academicCommunities: true
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
    const institution = profile.institution;
    const institutionData = {
      id: profile.id,
      name: institution?.institutionName || profile.firstName + ' ' + profile.lastName,
      type: institution?.institutionType || 'Unknown',
      category: institution?.institutionTypeRef?.name || '',
      location: profile.location || '',
      bio: profile.bio || '',
      logo: profile.profileImageUrl || institution?.logoUrl || '/images/pathpiper-logo.png',
      coverImage: institution?.coverImageUrl || '',
      website: institution?.website || '',
      verified: institution?.verified || false,
      founded: null, // Add founded field to schema if needed
      tagline: profile.tagline || '',
      overview: institution?.overview || '',
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
