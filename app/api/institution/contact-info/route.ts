import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')

    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use provided institutionId or current user's id
    const targetInstitutionId = institutionId || user.id

    // Verify the institution exists
    const institutionExists = await prisma.profile.findFirst({
      where: { 
        id: targetInstitutionId,
        role: 'institution'
      }
    })

    if (!institutionExists) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    // Get contact info
    const contactInfo = (await prisma.$queryRaw`
      SELECT * FROM institution_contact_info WHERE institution_id = ${targetInstitutionId}::uuid
    `) as any[]

    return NextResponse.json({ contactInfo: Array.isArray(contactInfo) ? contactInfo[0] : null })
  } catch (error) {
    console.error('Error fetching institution contact info:', error)
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()
    const {
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      email,
      website
    } = body

    // Check if contact info already exists
    const existingContactInfo = await prisma.$queryRaw`
      SELECT id FROM institution_contact_info WHERE institution_id = ${user.id}::uuid
    `

    if (Array.isArray(existingContactInfo) && existingContactInfo.length > 0) {
      // Update existing record
      await prisma.$queryRaw`
        UPDATE institution_contact_info 
        SET 
          address = ${address || null},
          city = ${city || null},
          state = ${state || null},
          postal_code = ${postalCode || null},
          country = ${country || null},
          phone = ${phone || null},
          email = ${email || null},
          website = ${website || null},
          updated_at = NOW()
        WHERE institution_id = ${user.id}::uuid
      `
    } else {
      // Insert new record
      await prisma.$queryRaw`
        INSERT INTO institution_contact_info 
        (institution_id, address, city, state, postal_code, country, phone, email, website)
        VALUES (${user.id}::uuid, ${address || null}, ${city || null}, ${state || null}, 
                ${postalCode || null}, ${country || null}, ${phone || null}, ${email || null}, ${website || null})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution contact info:', error)
    return NextResponse.json({ error: 'Failed to save contact info' }, { status: 500 })
  }
}