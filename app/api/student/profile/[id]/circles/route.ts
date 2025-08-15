
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    
    console.log('API: Student circles request received for:', studentId)

    // Get circles for the specific student - optimized query
    const circles = await prisma.circleBadge.findMany({
      where: {
        OR: [
          { 
            creatorId: studentId,
            // Don't show if circle is globally disabled or creator is disabled
            isDisabled: { not: true },
            isCreatorDisabled: { not: true }
          },
          {
            memberships: {
              some: {
                userId: studentId,
                status: 'active',
                // Don't show if member is disabled
                isDisabledMember: { not: true }
              }
            },
            // Don't show if circle is globally disabled
            isDisabled: { not: true }
          }
        ]
      },
      select: {
        id: true,
        creatorId: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        isDefault: true,
        isDisabled: true,
        isCreatorDisabled: true,
        createdAt: true,
        updatedAt: true,
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
          select: {
            id: true,
            status: true,
            joinedAt: true,
            isDisabledMember: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
                role: true,
                bio: true,
                availabilityStatus: true
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
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    })

    console.log(`API: Found ${circles.length} circles for student ${studentId}`)

    return NextResponse.json(circles)
  } catch (error) {
    console.error('Error fetching student circles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
