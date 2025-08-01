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
    console.log('🖼️ Institution gallery GET request received')

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

    console.log('🔍 Fetching gallery for institution:', targetInstitutionId)

    // Get gallery images for this institution
    const gallery = await prisma.institutionGallery.findMany({
      where: { institutionId: targetInstitutionId },
      orderBy: { createdAt: 'desc' }
    })

    console.log('🖼️ Gallery images found:', gallery.length)

    // Helper function to convert relative paths to full URLs
    const getFullImageUrl = (imagePath: string | null) => {
      if (!imagePath) return null;
      
      // If already a full URL, return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      
      // If starts with /uploads/, make it a full URL
      if (imagePath.startsWith('/uploads/')) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}${imagePath}`;
      }
      
      // If it's just a filename or relative path, assume it's in uploads
      if (!imagePath.startsWith('/')) {
        return `${process.env.NEXT_PUBLIC_APP_URL || 'https://pathpiper.com'}/uploads/${imagePath}`;
      }
      
      // For other paths starting with /, return as is (they should be accessible)
      return imagePath;
    };

    // Format the response consistently
    const formattedGallery = gallery.map(img => ({
      id: img.id,
      url: getFullImageUrl(img.imageUrl),
      caption: img.caption || ''
    }))

    console.log('🖼️ Returning formatted gallery:', formattedGallery)

    return NextResponse.json({ images: formattedGallery })
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    return NextResponse.json({ error: 'Failed to fetch gallery images' }, { status: 500 })
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
    const { images } = body

    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Images array is required' }, { status: 400 })
    }

    // Only insert new gallery images (don't delete existing ones)
    if (images.length > 0) {
      const galleryData = images.map((image: any) => ({
        institutionId: user.id,
        imageUrl: image.url,
        caption: image.caption || null
      }))

      await prisma.institutionGallery.createMany({
        data: galleryData
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving gallery images:', error)
    return NextResponse.json({ error: 'Failed to save gallery images' }, { status: 500 })
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
    const imageId = searchParams.get('imageId')

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    await prisma.institutionGallery.delete({
      where: { 
        id: imageId,
        institutionId: user.id // Ensure user can only delete their own images
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ error: 'Failed to delete gallery image' }, { status: 500 })
  }
}