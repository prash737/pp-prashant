
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { educationId, action } = await request.json()

    if (!educationId || !['verify', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Check if the user is an institution and has permission to verify this education record
    const institutionProfile = await prisma.institutionProfile.findUnique({
      where: { id: user.id }
    })

    if (!institutionProfile) {
      return NextResponse.json({ error: 'Not authorized as institution' }, { status: 403 })
    }

    // Get the education record and verify it belongs to this institution
    const educationRecord = await prisma.studentEducationHistory.findUnique({
      where: { id: educationId },
      include: {
        student: {
          include: {
            profile: true
          }
        }
      }
    })

    if (!educationRecord) {
      return NextResponse.json({ error: 'Education record not found' }, { status: 404 })
    }

    if (educationRecord.institutionId !== user.id) {
      return NextResponse.json({ error: 'Not authorized to verify this record' }, { status: 403 })
    }

    // Update the verification status
    const updatedRecord = await prisma.studentEducationHistory.update({
      where: { id: educationId },
      data: {
        institutionVerified: action === 'verify'
      }
    })

    return NextResponse.json({ 
      success: true, 
      verified: updatedRecord.institutionVerified 
    })
  } catch (error) {
    console.error('Error updating verification status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get pending verification requests for this institution
    const pendingVerifications = await prisma.studentEducationHistory.findMany({
      where: {
        institutionId: user.id,
        institutionVerified: null // Pending verification
      },
      include: {
        student: {
          include: {
            profile: true
          }
        },
        institutionType: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedData = pendingVerifications.map(record => ({
      id: record.id,
      studentName: `${record.student.profile.firstName} ${record.student.profile.lastName}`,
      studentId: record.studentId,
      degreeProgram: record.degreeProgram,
      fieldOfStudy: record.fieldOfStudy,
      subjects: record.subjects,
      startDate: record.startDate,
      endDate: record.endDate,
      isCurrent: record.isCurrent,
      gradeLevel: record.gradeLevel,
      description: record.description,
      createdAt: record.createdAt
    }))

    return NextResponse.json({ verificationRequests: transformedData })
  } catch (error) {
    console.error('Error fetching verification requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
