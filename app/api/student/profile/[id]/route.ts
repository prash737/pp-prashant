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

    // Check if this is a public view request
    const isPublicView = request.headers.get('X-Public-View') === 'true'
    let user = null
    let currentUserProfile = null

    if (!isPublicView) {
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
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken)

      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      user = authUser

      // Check if the current user has permission to view student profiles
      const { data: userProfile, error: currentUserError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (currentUserError || !userProfile || !['student', 'institution', 'mentor'].includes(userProfile.role)) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      currentUserProfile = userProfile
    }

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

        // Circle memberships (student is a member)
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

        // Circles created by the student
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
      const connectionRequestsSent = [] // Placeholder, fetched below if applicable
      const connectionRequestsReceived = [] // Placeholder, fetched below if applicable
      const circleInvitations = [] // Placeholder, fetched below if applicable

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
        circles: circlesMemberResult.data?.map(membership => {
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
            memberships: [], // To be populated if needed
            _count: {
              memberships: memberCount
            }
          }
        }) || [],
        suggestedConnections: [], // This needs a separate query if not in RPC
        connectionRequestsSent: [], // This needs a separate query if not in RPC
        connectionRequestsReceived: [], // This needs a separate query if not in RPC
        circleInvitations: [] // This needs a separate query if not in RPC
      }

      // Calculate connection counts
      const allConnections = transformedData.connections
      transformedData.connectionCounts = {
        total: allConnections.length,
        students: allConnections.filter(conn => conn.role === 'student').length,
        mentors: allConnections.filter(conn => conn.role === 'mentor').length,
        institutions: allConnections.filter(conn => conn.role === 'institution').length
      }

      // Fetch suggested connections
      const { data: suggestedConnections } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          profile_image_url,
          role,
          bio,
          user_interests (
            interests (
              id,
              name
            )
          )
        `)
        .in('role', ['student', 'mentor'])
        .neq('id', studentId)
        .limit(6)

      transformedData.suggestedConnections = suggestedConnections || []

      // Fetch pending connection requests and circle invitations (only for own profile and authenticated users)
      if (user && user.id === studentId) {
        const [sentRequests, receivedRequests, invitations] = await Promise.all([
          supabase
            .from('connection_requests')
            .select(`
              id,
              created_at,
              receiver:profiles!connection_requests_receiver_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                role
              )
            `)
            .eq('sender_id', user.id)
            .eq('status', 'pending'),

          supabase
            .from('connection_requests')
            .select(`
              id,
              created_at,
              sender:profiles!connection_requests_sender_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                role
              )
            `)
            .eq('receiver_id', user.id)
            .eq('status', 'pending'),

          supabase
            .from('circle_invitations')
            .select(`
              id,
              created_at,
              status,
              circle_badges (
                id,
                name,
                description,
                color,
                icon,
                creator:profiles!circle_badges_creator_id_fkey (
                  id,
                  first_name,
                  last_name,
                  profile_image_url
                )
              ),
              inviter:profiles!circle_invitations_inviter_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url
              )
            `)
            .eq('invitee_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
        ])

        transformedData.connectionRequestsSent = sentRequests.data || []
        transformedData.connectionRequestsReceived = receivedRequests.data || []
        transformedData.circleInvitations = invitations.data || []
      }

      const response = {
        ...transformedData,
        userInterests: userInterests,
        userSkills: userSkills,
        achievements: achievements,
        followingInstitutions: followingInstitutions,
        connectionRequestsSent: connectionRequestsSent,
        connectionRequestsReceived: connectionRequestsReceived,
        circleInvitations: circleInvitations,
        circles: [] // This will be fetched separately by the circles API
      }

      console.log('🚀 API Response - Full transformed data being returned:')
      console.log('📋 Basic profile info:', {
        id: response.id,
        firstName: response.profile?.firstName,
        lastName: response.profile?.lastName,
        bio: response.profile?.bio,
        location: response.profile?.location,
        profileImageUrl: response.profile?.profileImageUrl,
        tagline: response.profile?.tagline
      })
      console.log('📊 Connection counts:', response.connectionCounts)
      console.log('🎯 Circles count:', response.circles?.length || 0)
      console.log('🎖️ Achievements count:', response.achievements?.length || 0)
      console.log('🎨 User interests count:', response.profile?.userInterests?.length || 0)
      console.log('⚡ User skills count:', response.profile?.userSkills?.length || 0)
      console.log('📚 Education history count:', response.educationHistory?.length || 0)

      return NextResponse.json(response)
    }

    // If RPC function works, transform its data to match expected format
    if (studentData && studentData.length > 0) {
      const data = studentData[0]
      
      // Transform the flat RPC response to match expected nested structure
      const transformedData = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        location: data.location,
        profile_image_url: data.profile_image_url,
        cover_image_url: data.cover_image_url,
        verification_status: data.verification_status,
        tagline: data.tagline,
        ageGroup: data.age_group,
        educationLevel: data.education_level,
        birthMonth: data.birth_month,
        birthYear: data.birth_year,
        personalityType: data.personality_type,
        learningStyle: data.learning_style,
        favoriteQuote: data.favorite_quote,
        profile: {
          firstName: data.first_name,
          lastName: data.last_name,
          bio: data.bio,
          location: data.location,
          profileImageUrl: data.profile_image_url,
          coverImageUrl: data.cover_image_url,
          verificationStatus: data.verification_status,
          tagline: data.tagline,
          userInterests: data.user_interests || [],
          userSkills: data.user_skills || [],
          socialLinks: data.social_links || []
        },
        educationHistory: data.education_history || [],
        goals: data.goals || [],
        userCollections: data.user_collections || [],
        achievements: data.achievements || [],
        connections: [
          ...(data.sent_connections || []),
          ...(data.received_connections || [])
        ],
        connectionCounts: {
          total: (data.sent_connections?.length || 0) + (data.received_connections?.length || 0),
          students: 0,
          mentors: 0,
          institutions: 0
        },
        followingInstitutions: data.institution_following || [],
        circles: data.circles || [],
        createdCircles: data.created_circles || [],
        suggestedConnections: [],
        connectionRequestsSent: user && user.id === studentId ? [] : undefined,
        connectionRequestsReceived: user && user.id === studentId ? [] : undefined,
        circleInvitations: user && user.id === studentId ? [] : undefined
      }

      // Calculate connection counts by role
      const allConnections = [
        ...(data.sent_connections || []),
        ...(data.received_connections || [])
      ]
      
      transformedData.connectionCounts = {
        total: allConnections.length,
        students: allConnections.filter(conn => 
          conn.sender?.role === 'student' || conn.receiver?.role === 'student' || 
          conn.accepter?.role === 'student' || conn.requester?.role === 'student'
        ).length,
        mentors: allConnections.filter(conn => 
          conn.sender?.role === 'mentor' || conn.receiver?.role === 'mentor' || 
          conn.accepter?.role === 'mentor' || conn.requester?.role === 'mentor'
        ).length,
        institutions: allConnections.filter(conn => 
          conn.sender?.role === 'institution' || conn.receiver?.role === 'institution' || 
          conn.accepter?.role === 'institution' || conn.requester?.role === 'institution'
        ).length
      }

      console.log('🚀 RPC Response transformed:', {
        id: transformedData.id,
        hasProfile: !!transformedData.profile,
        profileName: `${transformedData.profile?.firstName} ${transformedData.profile?.lastName}`,
        educationCount: transformedData.educationHistory?.length || 0,
        achievementsCount: transformedData.achievements?.length || 0,
        followingCount: transformedData.followingInstitutions?.length || 0,
        interestsCount: transformedData.profile?.userInterests?.length || 0,
        skillsCount: transformedData.profile?.userSkills?.length || 0
      })

      return NextResponse.json(transformedData)
    }

    return NextResponse.json({ error: 'No data found' }, { status: 404 })

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}