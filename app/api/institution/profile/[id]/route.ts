
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

    console.log('🏛️ Fetching institution profile for cross-role access, ID:', institutionId)

    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if the current user has permission to view institution profiles
    const currentUserProfile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { role: true }
    })

    if (!currentUserProfile || !['student', 'institution', 'mentor'].includes(currentUserProfile.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if the target profile exists and is an institution
    const targetProfile = await prisma.profile.findUnique({
      where: { id: institutionId },
      select: { role: true }
    })

    if (!targetProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (targetProfile.role !== 'institution') {
      return NextResponse.json(
        { error: 'Profile is not an institution profile' },
        { status: 403 }
      )
    }

    // Get institution profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { 
        id: institutionId,
        role: 'institution'
      },
      include: {
        institution: true
      }
    })

    if (!profile || !profile.institution) {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    console.log('✅ Institution profile found:', profile.institution.institutionName)

    // Check if viewing own profile
    const isOwnProfile = institutionId === user.id

    // Helper function to convert relative paths to full URLs
    const getFullImageUrl = (imagePath: string | null) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath; // Already a full URL
      }
      if (imagePath.startsWith('/uploads/')) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}${imagePath}`;
      }
      if (imagePath.startsWith('/images/')) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}${imagePath}`;
      }
      return imagePath;
    };

    // Transform data to match the expected format
    const institutionData = {
      id: profile.id,
      name: profile.institution.institutionName,
      type: profile.institution.institutionType,
      category: profile.institution.category,
      location: profile.institution.location || profile.location,
      bio: profile.bio || '',
      logo: getFullImageUrl(profile.profileImageUrl || profile.institution.logoUrl || profile.institution.logo) || `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}/images/pathpiper-logo.png`,
      coverImage: getFullImageUrl(profile.institution.coverImage) || '',
      website: profile.institution.website || '',
      verified: profile.institution.verified || false,
      founded: profile.institution.founded,
      tagline: profile.institution.tagline || '',
      overview: profile.institution.overview || '',
      mission: profile.institution.mission || '',
      coreValues: profile.institution.core_values || [],
      gallery: (profile.institution.gallery || []).map((img: any) => ({
        ...img,
        url: getFullImageUrl(img.url) || img.url
      })),
      isOwnProfile
    }

    return NextResponse.json(institutionData)

  } catch (error) {
    console.error('Institution profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}
