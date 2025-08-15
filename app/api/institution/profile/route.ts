import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log('🏛️ Institution profile GET request received')

    // No authentication check - open access to institution profiles

    console.log('🔍 Fetching institution profile')

    // Get institution profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { id: "clx2y0o5h000008jph18t86l0" }, // Hardcoded user ID for now
      include: {
        institution: true
      }
    })

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    console.log('✅ Institution profile found:', profile.institution?.institutionName)

    // Helper function to handle image URLs (base64 or traditional URLs)
    const getImageUrl = (imagePath: string | null) => {
      if (!imagePath) return null;

      // If it's a base64 data URL, return as is
      if (imagePath.startsWith('data:image/')) {
        return imagePath;
      }

      // If already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      // If starts with /uploads/, make it a full URL (legacy support)
      if (imagePath.startsWith('/uploads/')) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}${imagePath}`;
      }

      return imagePath;
    };

    return NextResponse.json({ 
      profile: {
        ...profile,
        ...profile.institution,
        bio: profile.bio,
        overview: profile.institution?.overview,
        logoUrl: getImageUrl(profile.institution?.logoUrl),
        coverImageUrl: getImageUrl(profile.institution?.coverImageUrl),
      }
    })

  } catch (error) {
    console.error('Institution profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏛️ Institution profile POST request received')

    // No authentication check - open access to institution profiles

    console.log('🔍 Fetching institution profile')

    // Get institution profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { id: "clx2y0o5h000008jph18t86l0" }, // Hardcoded user ID for now
      include: {
        institution: true
      }
    })

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    console.log('✅ Institution profile found:', profile.institution?.institutionName)

    // Helper function to handle image URLs (base64 or traditional URLs)
    const getImageUrl = (imagePath: string | null) => {
      if (!imagePath) return null;

      // If it's a base64 data URL, return as is
      if (imagePath.startsWith('data:image/')) {
        return imagePath;
      }

      // If already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      // If starts with /uploads/, make it a full URL (legacy support)
      if (imagePath.startsWith('/uploads/')) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}${imagePath}`;
      }

      return imagePath;
    };

    return NextResponse.json({ 
      profile: {
        ...profile,
        ...profile.institution,
        bio: profile.bio,
        overview: profile.institution?.overview,
        logoUrl: getImageUrl(profile.institution?.logoUrl),
        coverImageUrl: getImageUrl(profile.institution?.coverImageUrl),
      }
    })

  } catch (error) {
    console.error('Institution profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🏛️ Institution profile PATCH request received')

    // No authentication check - open access to institution profiles

    const body = await request.json()
    const { overview, mission, coreValues, logoUrl, coverImageUrl } = body

    console.log('📝 Updating institution profile for user:', "clx2y0o5h000008jph18t86l0") // Hardcoded user ID for now

    // Get current profile to ensure it's an institution
    const profile = await prisma.profile.findUnique({
      where: { id: "clx2y0o5h000008jph18t86l0" }, // Hardcoded user ID for now
      include: {
        institution: true
      }
    })

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    // Update institution profile
    const updatedInstitution = await prisma.institutionProfile.update({
      where: { id: profile.institution!.id },
      data: {
        overview: overview || null,
        mission: mission || null,
        coreValues: coreValues || null,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
        updatedAt: new Date()
      }
    })

    console.log('✅ Institution profile updated successfully')

    return NextResponse.json({ 
      success: true,
      institution: updatedInstitution
    })

  } catch (error) {
    console.error('Institution profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update institution profile' },
      { status: 500 }
    )
  }
}