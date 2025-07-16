
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie to verify authentication
    const cookieStore = request.headers.get('cookie') || ''
    const cookies = Object.fromEntries(
      cookieStore.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=')
        return [name, decodeURIComponent(rest.join('='))]
      })
    )

    const accessToken = cookies['sb-access-token']
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const interestsParam = searchParams.get('interests')

    if (!interestsParam) {
      return NextResponse.json([])
    }

    const interestIds = interestsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))

    if (interestIds.length === 0) {
      return NextResponse.json([])
    }

    // Find users with shared interests, excluding current user and existing connections
    const suggestedUsers = await prisma.profile.findMany({
      where: {
        AND: [
          {
            id: {
              not: user.id // Exclude current user
            }
          },
          {
            userInterests: {
              some: {
                interestId: {
                  in: interestIds
                }
              }
            }
          },
          // Exclude users who already have connection requests or connections
          {
            AND: [
              {
                receivedConnections: {
                  none: {
                    senderId: user.id
                  }
                }
              },
              {
                sentConnections: {
                  none: {
                    receiverId: user.id
                  }
                }
              },
              {
                connections1: {
                  none: {
                    user2Id: user.id
                  }
                }
              },
              {
                connections2: {
                  none: {
                    user1Id: user.id
                  }
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        profileImageUrl: true,
        bio: true,
        location: true,
        userInterests: {
          where: {
            interestId: {
              in: interestIds
            }
          },
          select: {
            interest: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      take: 20 // Get more to ensure we have enough after processing
    })

    // Process and rank suggestions by number of shared interests
    const processedSuggestions = suggestedUsers.map(user => {
      const sharedInterests = user.userInterests.map(ui => ui.interest.name)
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        location: user.location,
        sharedInterests,
        totalSharedInterests: sharedInterests.length
      }
    })

    // Sort by number of shared interests (descending) and then by name
    const sortedSuggestions = processedSuggestions
      .sort((a, b) => {
        if (b.totalSharedInterests !== a.totalSharedInterests) {
          return b.totalSharedInterests - a.totalSharedInterests
        }
        return a.firstName.localeCompare(b.firstName)
      })

    return NextResponse.json(sortedSuggestions)

  } catch (error) {
    console.error('Error fetching suggested connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
