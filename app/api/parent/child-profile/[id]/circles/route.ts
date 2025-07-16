import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const childId = resolvedParams.id

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

    // Fetch child's circles (created by child and circles they're members of)
    const circles = await prisma.circleBadge.findMany({
      where: {
        OR: [
          { creatorId: childId },
          {
            memberships: {
              some: {
                userId: childId,
                status: 'active'
              }
            }
          }
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        },
        memberships: {
          where: {
            status: 'active'
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            memberships: {
              where: {
                status: 'active'
              }
            }
          }
        },
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      circles
    })

  } catch (error) {
    console.error('Error fetching child circles:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}