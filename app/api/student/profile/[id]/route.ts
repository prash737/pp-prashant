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

    // Check if the current user has permission to view student profiles
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (currentUserError || !currentUserProfile || !['student', 'institution', 'mentor'].includes(currentUserProfile.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
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
        // Basic profile data
        supabase
          .from('profiles')
          .select(`
            *,
            student_profiles (*),
            user_interests (
              id,
              created_at,
              interests (
                id,
                name,
                interest_categories (
                  id,
                  name
                )
              )
            ),
            user_skills (
              id,
              proficiency_level,
              created_at,
              skills (
                id,
                name,
                category_id,
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
              created_at,
              achievement_image_icon,
              achievement_type_id,
              achievement_types (
                id,
                name
              )
            ),
            goals (
              id,
              title,
              description,
              status,
              created_at,
              updated_at
            ),
            user_collections (
              id,
              name,
              description,
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
              institution_types (
                id,
                name,
                institution_type_categories (
                  id,
                  name
                )
              )
            ),
            social_links (*),
            sent_connections:connection_requests (
              id,
              created_at,
              status,
              receiver:profiles!connection_requests_receiver_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                role
              )
            ),
            received_connections:connection_requests (
              id,
              created_at,
              status,
              sender:profiles!connection_requests_sender_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                role
              )
            ),
            institution_following:institution_follow_connections (
              id,
              connected_at,
              receiver:profiles!institution_follow_connections_receiver_id_fkey (
                id,
                first_name,
                last_name,
                profile_image_url,
                verification_status,
                institution_profiles (
                  institution_name,
                  institution_type,
                  institution_type_id,
                  website,
                  logo_url,
                  verified,
                  institution_types (
                    name,
                    institution_type_categories (
                      name
                    )
                  )
                )
              )
            )
          `)
          .eq('id', studentId)
          .eq('role', 'student')
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
          .eq('status', 'active'),

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
      ])

      const [
        profileResult,
        circlesMemberResult,
        createdCirclesResult
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
          total: (profile.sent_connections?.length || 0) + (profile.received_connections?.length || 0),
          students: 0,
          mentors: 0,
          institutions: 0
        },
        followingInstitutions: profile.institution_following || [],
        circles: circlesMemberResult.data?.map(membership => ({
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
            memberships: 0 // To be calculated if needed
          }
        })) || [],
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

      // Fetch pending connection requests and circle invitations (only for own profile)
      if (user.id === studentId) {
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

    // If RPC function works, return its data
    return NextResponse.json(studentData)

  } catch (error) {
    console.error('Error fetching student profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}