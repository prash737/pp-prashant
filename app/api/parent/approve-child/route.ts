import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const parentId = cookieStore.get('parent_id')?.value
    const parentSession = cookieStore.get('parent_session')?.value

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { childId } = await request.json()

    if (!childId) {
      return NextResponse.json(
        { success: false, error: 'Child ID is required' },
        { status: 400 }
      )
    }

    // Verify that the child belongs to this parent
    const child = await prisma.profile.findFirst({
      where: {
        id: childId,
        parentId: parentId,
        role: 'student'
      }
    })

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found or not authorized' },
        { status: 404 }
      )
    }

    // Update the parent_verified field to true
    await prisma.profile.update({
      where: { id: childId },
      data: { parentVerified: true }
    })

    console.log(`✅ Parent approved account for child ${childId}`)

    return NextResponse.json({
      success: true,
      message: 'Child account approved successfully'
    })

  } catch (error) {
    console.error('Error approving child account:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve account' },
      { status: 500 }
    )
  }
}