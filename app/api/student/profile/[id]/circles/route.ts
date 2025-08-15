
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studentId } = await params;
    
    console.log('API: Student circles request received for:', studentId)

    const cookieStore = request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log('API: No access token found in cookies')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)

    if (error || !user) {
      console.log('API: Token verification failed:', error?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('API: Authenticated user found:', user.id)

    // Get circles for the specific student (only those visible to others)
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
        ],
        // Only show non-private circles in public view
        // Add privacy filter here if you have privacy settings
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
        },
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
