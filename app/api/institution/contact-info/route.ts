
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
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

    // Fetch contact info for the institution
    const contactInfo = await prisma.$queryRaw`
      SELECT * FROM institution_contact_info WHERE institution_id = ${user.id}::uuid
    `

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
      email
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
          zip_code = ${postalCode || null},
          country = ${country || null},
          phone = ${phone || null},
          email = ${email || null},
          updated_at = NOW()
        WHERE institution_id = ${user.id}::uuid
      `
    } else {
      // Insert new record
      await prisma.$queryRaw`
        INSERT INTO institution_contact_info 
        (institution_id, address, city, state, zip_code, country, phone, email)
        VALUES (${user.id}::uuid, ${address || null}, ${city || null}, ${state || null}, 
                ${postalCode || null}, ${country || null}, ${phone || null}, ${email || null})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution contact info:', error)
    return NextResponse.json({ error: 'Failed to save contact info' }, { status: 500 })
  }
}
