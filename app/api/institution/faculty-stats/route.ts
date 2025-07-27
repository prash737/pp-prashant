
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { prisma } from "@/lib/prisma"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')

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

    // Fetch faculty stats for the institution
    const facultyStats = await prisma.institutionFacultyStats.findUnique({
      where: { institutionId: targetInstitutionId }
    })

    return NextResponse.json({ facultyStats })
  } catch (error) {
    console.error('Error fetching institution faculty stats:', error)
    return NextResponse.json({ error: 'Failed to fetch faculty stats' }, { status: 500 })
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
    const { 
      totalFaculty, 
      studentFacultyRatioStudent, 
      studentFacultyRatioFaculty, 
      facultyWithPhds, 
      internationalFacultyPercentage 
    } = body

    // Check if faculty stats already exist
    const existingStats = await prisma.institutionFacultyStats.findUnique({
      where: { institutionId: user.id }
    })

    let facultyStats

    if (existingStats) {
      // Update existing record
      facultyStats = await prisma.institutionFacultyStats.update({
        where: { institutionId: user.id },
        data: {
          totalFaculty: totalFaculty ? parseInt(totalFaculty) : null,
          studentFacultyRatioStudents: studentFacultyRatioStudent ? parseInt(studentFacultyRatioStudent) : null,
          studentFacultyRatioFaculty: studentFacultyRatioFaculty ? parseInt(studentFacultyRatioFaculty) : null,
          facultyWithPhdsPercentage: facultyWithPhds ? parseInt(facultyWithPhds) : null,
          internationalFacultyPercentage: internationalFacultyPercentage ? parseInt(internationalFacultyPercentage) : null
        }
      })
    } else {
      // Create new record
      facultyStats = await prisma.institutionFacultyStats.create({
        data: {
          institutionId: user.id,
          totalFaculty: totalFaculty ? parseInt(totalFaculty) : null,
          studentFacultyRatioStudents: studentFacultyRatioStudent ? parseInt(studentFacultyRatioStudent) : null,
          studentFacultyRatioFaculty: studentFacultyRatioFaculty ? parseInt(studentFacultyRatioFaculty) : null,
          facultyWithPhdsPercentage: facultyWithPhds ? parseInt(facultyWithPhds) : null,
          internationalFacultyPercentage: internationalFacultyPercentage ? parseInt(internationalFacultyPercentage) : null
        }
      })
    }

    return NextResponse.json({ success: true, facultyStats })
  } catch (error) {
    console.error('Error saving institution faculty stats:', error)
    return NextResponse.json({ error: 'Failed to save faculty stats' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    
    // Only update fields that are provided
    const updateData: any = {}
    
    if (body.totalFaculty !== undefined) {
      updateData.totalFaculty = body.totalFaculty ? parseInt(body.totalFaculty) : null
    }
    if (body.studentFacultyRatioStudent !== undefined) {
      updateData.studentFacultyRatioStudents = body.studentFacultyRatioStudent ? parseInt(body.studentFacultyRatioStudent) : null
    }
    if (body.studentFacultyRatioFaculty !== undefined) {
      updateData.studentFacultyRatioFaculty = body.studentFacultyRatioFaculty ? parseInt(body.studentFacultyRatioFaculty) : null
    }
    if (body.facultyWithPhds !== undefined) {
      updateData.facultyWithPhdsPercentage = body.facultyWithPhds ? parseInt(body.facultyWithPhds) : null
    }
    if (body.internationalFacultyPercentage !== undefined) {
      updateData.internationalFacultyPercentage = body.internationalFacultyPercentage ? parseInt(body.internationalFacultyPercentage) : null
    }

    const facultyStats = await prisma.institutionFacultyStats.upsert({
      where: { institutionId: user.id },
      update: updateData,
      create: {
        institutionId: user.id,
        ...updateData
      }
    })

    return NextResponse.json({ success: true, facultyStats })
  } catch (error) {
    console.error('Error updating institution faculty stats:', error)
    return NextResponse.json({ error: 'Failed to update faculty stats' }, { status: 500 })
  }
}
