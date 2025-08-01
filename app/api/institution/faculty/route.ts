import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    console.log('👨‍🏫 Institution faculty GET request received')

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

    // Check if institutionId is provided (for public view)
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const targetInstitutionId = institutionId || user.id

    console.log('🔍 Fetching faculty for institution:', targetInstitutionId)

    // Get faculty for this institution
    const faculty = await prisma.institutionFaculty.findMany({
      where: { institutionId: targetInstitutionId },
      orderBy: { createdAt: 'desc' }
    })

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

    // Format the response consistently
    const formattedFaculty = faculty.map(member => ({
      id: member.id,
      name: member.name,
      title: member.title,
      department: member.department,
      email: member.email,
      bio: member.bio,
      image: getImageUrl(member.image), // Use 'image' instead of 'imageUrl' for consistency
      expertise: member.expertise,
      qualifications: member.qualifications,
      experience: member.experience,
      specialization: member.specialization,
      featured: member.featured
    }))

    return NextResponse.json({ faculty: formattedFaculty })
  } catch (error) {
    console.error('Error fetching institution faculty:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { faculty } = body

    if (!faculty || !Array.isArray(faculty)) {
      return NextResponse.json({ error: 'Invalid faculty data' }, { status: 400 })
    }

    // Insert new faculty members
    const createdFaculty = []
    for (const member of faculty) {
      if (!member.name || !member.title || !member.department || !member.email) {
        continue // Skip incomplete entries
      }

      const created = await prisma.institutionFaculty.create({
        data: {
          institutionId: user.id,
          name: member.name,
          title: member.title,
          department: member.department,
          image: member.image || null,
          expertise: member.expertise || [],
          email: member.email,
          bio: member.bio || null,
          qualifications: member.qualifications || null,
          experience: member.experience || null,
          specialization: member.specialization || null,
          featured: member.featured || false
        }
      })
      createdFaculty.push(created)
    }

    return NextResponse.json({ success: true, faculty: createdFaculty })
  } catch (error) {
    console.error('Error creating institution faculty:', error)
    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { faculty } = body

    if (!faculty || !Array.isArray(faculty)) {
      return NextResponse.json({ error: 'Invalid faculty data' }, { status: 400 })
    }

    // Update existing faculty members
    const updatedFaculty = []
    for (const member of faculty) {
      if (!member.id) continue

      const updated = await prisma.institutionFaculty.update({
        where: { 
          id: member.id,
          institutionId: user.id // Ensure user can only update their own faculty
        },
        data: {
          name: member.name,
          title: member.title,
          department: member.department,
          image: member.image || null,
          expertise: member.expertise || [],
          email: member.email,
          bio: member.bio || null,
          qualifications: member.qualifications || null,
          experience: member.experience || null,
          specialization: member.specialization || null,
          featured: member.featured || false
        }
      })
      updatedFaculty.push(updated)
    }

    return NextResponse.json({ success: true, faculty: updatedFaculty })
  } catch (error) {
    console.error('Error updating institution faculty:', error)
    return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from auth
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const facultyId = searchParams.get('id')

    if (!facultyId) {
      return NextResponse.json({ error: 'Faculty ID is required' }, { status: 400 })
    }

    await prisma.institutionFaculty.delete({
      where: { 
        id: facultyId,
        institutionId: user.id // Ensure user can only delete their own faculty
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting institution faculty:', error)
    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 })
  }
}