
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const studentId = resolvedParams.id

    // Check if the target profile exists and is a student
    const { data: targetProfile, error: targetProfileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', studentId)
      .single()

    if (targetProfileError || !targetProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (targetProfile.role !== 'student') {
      return NextResponse.json(
        { error: 'Profile is not a student profile' },
        { status: 403 }
      )
    }

    // Execute the comprehensive query using the optimized SQL
    const { data: studentData, error: studentDataError } = await supabase.rpc('get_comprehensive_student_profile', {
      student_id_param: studentId
    })

    if (studentDataError) {
      console.error('Error executing comprehensive student profile query:', studentDataError)

      // Fallback to individual queries if the RPC doesn't exist
      const queries = await Promise.all([
        // Main profile query with all related data
        supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            bio,
            location,
            profile_image_url,
            cover_image_url,
            verification_status,
            tagline,
            social_links,
            student_profiles!inner (
              age_group,
              education_level,
              birth_month,
              birth_year,
              personality_type,
              learning_style,
              favorite_quote,
              onboarding_completed
            ),
            user_interests (
              interest:interests (
                id,
                name,
                skill_categories (
                  id,
                  name
                )
              )
            ),
            user_skills (
              proficiency_level,
              skills (
                id,
                name,
                skill_categories (
                  id,
                  name
                )
              )
            ),
            user_achievements (
              id,
              name,
              description,
              date_of_achievement,
              achievement_image_icon,
              achievement_type_id,
              created_at
            ),
            goals (
              id,
              title,
              description,
              target_date,
              priority,
              status,
              created_at
            ),
            user_collections (
              id,
              name,
              description,
              is_private,
              created_at
            ),
            student_education_history (
              id,
              institution_name,
              institution_type_id,
              degree_program,
              field_of_study,
              subjects,
              start_date,
              end_date,
              is_current,
              grade_level,
              gpa,
              achievements,
              description,
              institution_verified,
              created_at
            ),
            sent_connections:connections!connections_requester_id_fkey (
              id,
              status,
              accepter:profiles!connections_accepter_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                role
              )
            ),
            received_connections:connections!connections_accepter_id_fkey (
              id,
              status,
              requester:profiles!connections_requester_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                role
              )
            ),
            institution_following (
              institution_profiles (
                id,
                institution_name,
                institution_type,
                location,
                logo_url,
                created_at
              )
            )
          `)
          .eq('id', studentId)
          .single(),

        // Circle memberships (student is a member) - only public circles
        supabase
          .from('circle_memberships')
          .select(`
            circle_id,
            status,
            is_disabled_member,
            joined_at,
            circle_badges (
              id,
              name,
              description,
              color,
              icon,
              is_default,
              is_disabled,
              is_creator_disabled,
              created_at,
              creator_id,
              creator:profiles!circle_badges_creator_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url
              )
            )
          `)
          .eq('user_id', studentId)
          .eq('status', 'active')
          .not('is_disabled_member', 'eq', true),

        // Circles created by the student - only public circles
        supabase
          .from('circle_badges')
          .select(`
            id,
            name,
            description,
            color,
            icon,
            is_default,
            is_disabled,
            is_creator_disabled,
            created_at,
            creator_id,
            creator:profiles!circle_badges_creator_id_fkey (
              id,
              first_name,
              last_name,
              profile_image_url
            )
          `)
          .eq('creator_id', studentId)
          .not('is_disabled', 'eq', true)
          .not('is_creator_disabled', 'eq', true),

        // Get all circle memberships for the circles (to get member counts)
        supabase
          .from('circle_memberships')
          .select(`
            circle_id,
            user_id,
            status,
            is_disabled_member,
            profiles (
              id,
              first_name,
              last_name,
              profile_image_url,
              role,
              bio
            )
          `)
          .eq('status', 'active')
          .not('is_disabled_member', 'eq', true)
      ])

      const [
        profileResult,
        circlesMemberResult,
        createdCirclesResult,
        allCircleMembershipsResult
      ] = queries

      if (profileResult.error || !profileResult.data) {
        return NextResponse.json(
          { error: 'Student profile not found' },
          { status: 404 }
        )
      }

      const profile = profileResult.data
      const studentProfile = profile.student_profiles?.[0]
      const userInterests = profile.user_interests || []
      const userSkills = profile.user_skills || []
      const achievements = profile.user_achievements || []
      const followingInstitutions = profile.institution_following || []

      // Count members for each circle
      const circleMemberCounts: { [circleId: string]: number } = {}
      allCircleMembershipsResult.data?.forEach(membership => {
        if (membership.circle_id) {
          circleMemberCounts[membership.circle_id] = (circleMemberCounts[membership.circle_id] || 0) + 1
        }
      })

      // Transform data to match expected format
      const transformedData = {
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        location: profile.location,
        profile_image_url: profile.profile_image_url,
        cover_image_url: profile.cover_image_url,
        verification_status: profile.verification_status,
        tagline: profile.tagline,
        ageGroup: studentProfile?.age_group,
        educationLevel: studentProfile?.education_level,
        birthMonth: studentProfile?.birth_month,
        birthYear: studentProfile?.birth_year,
        personalityType: studentProfile?.personality_type,
        learningStyle: studentProfile?.learning_style,
        favoriteQuote: studentProfile?.favorite_quote,
        profile: {
          firstName: profile.first_name,
          lastName: profile.last_name,
          bio: profile.bio,
          location: profile.location,
          profileImageUrl: profile.profile_image_url,
          coverImageUrl: profile.cover_image_url,
          verificationStatus: profile.verification_status,
          tagline: profile.tagline,
          userInterests: profile.user_interests || [],
          userSkills: profile.user_skills || [],
          skills: (profile.user_skills || []).map(us => ({
            id: us.skills?.id,
            name: us.skills?.name,
            proficiencyLevel: us.proficiency_level || 50,
            category: us.skills?.skill_categories?.name || 'General'
          })) || [],
          socialLinks: profile.social_links || []
        },
        educationHistory: profile.student_education_history || [],
        goals: profile.goals || [],
        userCollections: profile.user_collections || [],
        achievements: profile.user_achievements || [],
        connections: [
          ...(profile.sent_connections || []),
          ...(profile.received_connections || [])
        ],
        connectionCounts: {
          total: 0,
          students: 0,
          mentors: 0,
          institutions: 0
        },
        followingInstitutions: profile.institution_following?.map(f => f.institution_profiles) || [],
        circles: [
          ...(circlesMemberResult.data?.map(membership => {
            const memberCount = circleMemberCounts[membership.circle_id] || 0;
            return {
              id: membership.circle_badges.id,
              name: membership.circle_badges.name,
              description: membership.circle_badges.description,
              color: membership.circle_badges.color,
              icon: membership.circle_badges.icon,
              isDefault: membership.circle_badges.is_default,
              isDisabled: membership.circle_badges.is_disabled,
              isCreatorDisabled: membership.circle_badges.is_creator_disabled,
              createdAt: membership.circle_badges.created_at,
              creator: membership.circle_badges.creator,
              membership: {
                status: membership.status,
                joinedAt: membership.joined_at
              },
              _count: {
                memberships: memberCount
              }
            }
          }) || []),
          ...(createdCirclesResult.data?.map((circle: any) => ({
            ...circle,
            isCreated: true,
            membership: {
              status: 'creator',
              joinedAt: circle.created_at
            }
          })) || [])
        ],
        suggestedConnections: [], // Not needed for public view
        connectionRequestsSent: [], // Not needed for public view
        connectionRequestsReceived: [], // Not needed for public view
        circleInvitations: [] // Not needed for public view
      }

      // Calculate connection counts
      const allConnections = transformedData.connections
      transformedData.connectionCounts = {
        total: allConnections.length,
        students: allConnections.filter(conn => conn.accepter?.role === 'student' || conn.requester?.role === 'student').length,
        mentors: allConnections.filter(conn => conn.accepter?.role === 'mentor' || conn.requester?.role === 'mentor').length,
        institutions: allConnections.filter(conn => conn.accepter?.role === 'institution' || conn.requester?.role === 'institution').length
      }

      const response = {
        ...transformedData,
        userInterests: userInterests,
        userSkills: userSkills,
        achievements: achievements,
        followingInstitutions: followingInstitutions,
        connectionRequestsSent: [],
        connectionRequestsReceived: [],
        circleInvitations: [],
      }

      console.log('🚀 PUBLIC API FALLBACK - COMPLETE RESPONSE DATA:', JSON.stringify(response, null, 2))
      console.log('📋 PUBLIC API FALLBACK - Basic profile info:', {
        id: response.id,
        firstName: response.profile?.firstName,
        lastName: response.profile?.lastName,
        bio: response.profile?.bio,
        location: response.profile?.location,
        profileImageUrl: response.profile?.profileImageUrl,
        tagline: response.profile?.tagline
      })
      console.log('📊 PUBLIC API FALLBACK - Connection counts:', response.connectionCounts)
      console.log('🎯 PUBLIC API FALLBACK - Circles count:', response.circles?.length || 0)
      console.log('🎖️ PUBLIC API FALLBACK - Achievements count:', response.achievements?.length || 0)
      console.log('🎓 PUBLIC API FALLBACK - Education history count:', response.educationHistory?.length || 0)
      console.log('🏆 PUBLIC API FALLBACK - Goals count:', response.goals?.length || 0)
      console.log('💼 PUBLIC API FALLBACK - User collections count:', response.userCollections?.length || 0)
      console.log('🏢 PUBLIC API FALLBACK - Following institutions count:', response.followingInstitutions?.length || 0)

      return NextResponse.json(response)
    }

    // If RPC function works, return its data (filtered for public viewing)
    const publicData = studentData.map((data: any) => ({
      ...data,
      // Remove sensitive information
      connectionRequestsSent: [],
      connectionRequestsReceived: [],
      circleInvitations: []
    }))

    console.log('🔍 Public RPC studentData structure:', {
      hasEducationHistory: !!publicData?.[0]?.education_history,
      educationCount: publicData?.[0]?.education_history?.length || 0,
      sampleEducation: publicData?.[0]?.education_history?.[0]
    })
    
    console.log('🚀 PUBLIC API - COMPLETE RESPONSE DATA:', JSON.stringify(publicData, null, 2))
    console.log('🎯 PUBLIC API - Response Summary:', {
      studentId: publicData?.[0]?.id,
      firstName: publicData?.[0]?.first_name,
      lastName: publicData?.[0]?.last_name,
      bio: publicData?.[0]?.bio,
      location: publicData?.[0]?.location,
      profileImageUrl: publicData?.[0]?.profile_image_url,
      educationHistoryCount: publicData?.[0]?.education_history?.length || 0,
      circlesCount: publicData?.[0]?.circles?.length || 0,
      achievementsCount: publicData?.[0]?.achievements?.length || 0,
      goalsCount: publicData?.[0]?.goals?.length || 0,
      userInterestsCount: publicData?.[0]?.user_interests?.length || 0,
      userSkillsCount: publicData?.[0]?.user_skills?.length || 0,
      sentConnectionsCount: publicData?.[0]?.sent_connections?.length || 0,
      receivedConnectionsCount: publicData?.[0]?.received_connections?.length || 0,
      institutionFollowingCount: publicData?.[0]?.institution_following?.length || 0
    })
    
    return NextResponse.json(publicData)

  } catch (error) {
    console.error('Error fetching public student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
