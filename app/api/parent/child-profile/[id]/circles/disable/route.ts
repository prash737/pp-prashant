
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: childId } = resolvedParams
    const { circleId, disableType } = await request.json()

    // Get parent authentication from cookies
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const parentId = cookies['parent_id']
    const parentSession = cookies['parent_session']

    if (!parentId || !parentSession) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify parent-child relationship
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
        { status: 403 }
      )
    }

    if (disableType === 'child') {
      // Option A: Disable for only this child
      // First check if child is the creator of the circle
      const circle = await prisma.circleBadge.findFirst({
        where: {
          id: circleId,
          creatorId: childId
        }
      })

      if (circle) {
        // Child is the creator - update is_creator_disabled in circle_badges
        await prisma.circleBadge.update({
          where: {
            id: circleId
          },
          data: {
            isCreatorDisabled: true
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Circle disabled for child creator successfully'
        })
      } else {
        // Child is not the creator - check membership table
        const membership = await prisma.circleMembership.findFirst({
          where: {
            userId: childId,
            circleId: circleId
          }
        })

        if (!membership) {
          return NextResponse.json(
            { success: false, error: 'Child is not a member of this circle' },
            { status: 404 }
          )
        }

        await prisma.circleMembership.update({
          where: {
            id: membership.id
          },
          data: {
            isDisabledMember: true
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Circle disabled for child successfully'
        })
      }

    } else if (disableType === 'all') {
      // Option B: Disable for all members
      // Update the circle_badges table to set is_disabled = TRUE
      const circle = await prisma.circleBadge.findUnique({
        where: {
          id: circleId
        }
      })

      if (!circle) {
        return NextResponse.json(
          { success: false, error: 'Circle not found' },
          { status: 404 }
        )
      }

      await prisma.circleBadge.update({
        where: {
          id: circleId
        },
        data: {
          isDisabled: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Circle disabled for all members successfully'
      })

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid disable type' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error disabling circle:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
