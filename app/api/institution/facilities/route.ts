
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

    // Fetch facilities for the institution
    const facilities = await prisma.institutionFacility.findMany({
      where: { institutionId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ facilities })
  } catch (error) {
    console.error('Error fetching institution facilities:', error)
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 })
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
    const { facilities } = body

    // Only insert new facilities - don't delete existing ones
    const validFacilities = facilities.filter((facility: any) =>
      facility.name.trim() !== '' &&
      facility.description.trim() !== ''
    )

    if (validFacilities.length > 0) {
      await prisma.institutionFacility.createMany({
        data: validFacilities.map((facility: any) => ({
          institutionId: user.id,
          name: facility.name,
          description: facility.description,
          features: facility.features.filter((f: string) => f.trim() !== ''),
          images: facility.images.filter((img: string) => img.trim() !== ''),
          learnMoreLink: facility.learnMoreLink || null
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution facilities:', error)
    return NextResponse.json({ error: 'Failed to save facilities' }, { status: 500 })
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
    const { facilities } = body

    // Update existing facilities
    const updatePromises = facilities.map((facility: any) => 
      prisma.institutionFacility.update({
        where: { 
          id: facility.id,
          institutionId: user.id // Ensure user can only update their own facilities
        },
        data: {
          name: facility.name,
          description: facility.description,
          features: facility.features.filter((f: string) => f.trim() !== ''),
          images: facility.images.filter((img: string) => img.trim() !== ''),
          learnMoreLink: facility.learnMoreLink || null
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating institution facilities:', error)
    return NextResponse.json({ error: 'Failed to update facilities' }, { status: 500 })
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
    const facilityId = searchParams.get('id')

    if (!facilityId) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 })
    }

    // Delete the facility
    await prisma.institutionFacility.delete({
      where: { 
        id: facilityId,
        institutionId: user.id // Ensure user can only delete their own facilities
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting facility:', error)
    return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 })
  }
}
