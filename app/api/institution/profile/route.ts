
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log('🏛️ Institution profile GET request received')

    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching institution profile for user:', user.id)

    // Get institution profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        institution: true
      }
    })

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    console.log('✅ Institution profile found:', profile.institution?.institutionName)

    return NextResponse.json({ 
      profile: {
        ...profile,
        ...profile.institution,
        bio: profile.bio,
        overview: profile.institution?.overview
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

    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Fetching institution profile for user:', user.id)

    // Get institution profile with all related data
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      include: {
        institution: true
      }
    })

    if (!profile || profile.role !== 'institution') {
      return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
    }

    console.log('✅ Institution profile found:', profile.institution?.institutionName)

    return NextResponse.json({ 
      profile: {
        ...profile,
        ...profile.institution,
        bio: profile.bio,
        overview: profile.institution?.overview
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
