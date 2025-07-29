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

    // Check authentication (optional for public profiles, but helps with personalization)
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    let currentUser = null

    if (accessToken) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
      if (!authError && user) {
        currentUser = user
      }
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

    // Transform data to match the expected format
    const institutionData = {
      id: profile.id,
      name: profile.institution.institutionName,
      type: profile.institution.institutionType,
      category: profile.institution.category,
      location: profile.institution.location,
      bio: profile.bio || '',
      logo: profile.profileImageUrl || profile.institution.logoUrl || profile.institution.logo || '/images/pathpiper-logo.png',
      coverImage: profile.institution.coverImage || '',
      website: profile.institution.website || '',
      verified: profile.institution.verified || false,
      founded: profile.institution.founded,
      tagline: profile.institution.tagline || '',
      overview: profile.institution.overview || '',
      mission: profile.institution.mission || '',
      coreValues: profile.institution.core_values || [],
      gallery: profile.institution.gallery || []
    }

    console.log('📤 Institution data being sent:', {
      name: institutionData.name,
      mission: institutionData.mission,
      coreValues: institutionData.coreValues,
      coreValuesType: typeof institutionData.coreValues,
      coreValuesIsArray: Array.isArray(institutionData.coreValues)
    })

    return NextResponse.json(institutionData)

  } catch (error) {
    console.error('Public institution profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institution profile' },
      { status: 500 }
    )
  }
}