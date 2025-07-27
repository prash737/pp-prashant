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
      console.error('Auth error:', error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use provided institutionId or get from user profile
    let targetInstitutionId = institutionId

    if (!targetInstitutionId) {
      // Get institution profile
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: { institution: true }
      })

      if (!profile?.institution) {
        return NextResponse.json({ error: 'Institution profile not found' }, { status: 404 })
      }

      targetInstitutionId = user.id
    }

    // Get quick facts
    const quickFacts = (await prisma.$queryRaw`
      SELECT * FROM institution_quick_facts WHERE institution_id = ${targetInstitutionId}::uuid
    `) as any[]

    return NextResponse.json({ quickFacts: Array.isArray(quickFacts) ? quickFacts[0] : null })
  } catch (error) {
    console.error('Error fetching institution quick facts:', error)
    return NextResponse.json({ error: 'Failed to fetch quick facts' }, { status: 500 })
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
      undergraduateStudents,
      graduateStudents,
      facultyMembers,
      campusSize,
      campusSizeUnit,
      internationalStudents,
      ranking
    } = body

    // Check if quick facts already exist
    const existingQuickFacts = await prisma.$queryRaw`
      SELECT id FROM institution_quick_facts WHERE institution_id = ${user.id}::uuid
    `

    const campusSizeAcres = campusSizeUnit === 'acres' ? parseFloat(campusSize) || null : null
    const campusSizeKm2 = campusSizeUnit === 'hectares' ? parseFloat(campusSize) || null : 
                         campusSizeUnit === 'sq-km' ? parseFloat(campusSize) || null : 
                         campusSizeUnit === 'sq-miles' ? (parseFloat(campusSize) * 2.59) || null : null

    if (Array.isArray(existingQuickFacts) && existingQuickFacts.length > 0) {
      // Update existing record
      await prisma.$queryRaw`
        UPDATE institution_quick_facts 
        SET 
          undergraduate_students = ${undergraduateStudents ? parseInt(undergraduateStudents) : null},
          graduate_students = ${graduateStudents ? parseInt(graduateStudents) : null},
          faculty_members = ${facultyMembers ? parseInt(facultyMembers) : null},
          campus_size_acres = ${campusSizeAcres},
          campus_size_km2 = ${campusSizeKm2},
          international_students_countries = ${internationalStudents ? parseInt(internationalStudents) : null},
          global_ranking = ${ranking || null},
          updated_at = NOW()
        WHERE institution_id = ${user.id}::uuid
      `
    } else {
      // Insert new record
      await prisma.$queryRaw`
        INSERT INTO institution_quick_facts 
        (institution_id, undergraduate_students, graduate_students, faculty_members, 
         campus_size_acres, campus_size_km2, international_students_countries, global_ranking)
        VALUES (${user.id}::uuid, ${undergraduateStudents ? parseInt(undergraduateStudents) : null}, 
                ${graduateStudents ? parseInt(graduateStudents) : null}, 
                ${facultyMembers ? parseInt(facultyMembers) : null}, 
                ${campusSizeAcres}, ${campusSizeKm2}, 
                ${internationalStudents ? parseInt(internationalStudents) : null}, 
                ${ranking || null})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving institution quick facts:', error)
    return NextResponse.json({ error: 'Failed to save quick facts' }, { status: 500 })
  }
}