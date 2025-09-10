
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET /api/profile/personal-info - Request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ GET /api/profile/personal-info - No token found')
      return NextResponse.json({ error: 'Unauthorized - no access token' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ GET /api/profile/personal-info - Auth verification failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    const userId = authData.user.id
    console.log('✅ GET /api/profile/personal-info - User authenticated:', userId)

    // Fetch user profile using direct Supabase query with relationships
    console.log('🔍 Supabase Query: Fetching profile with relationships for user:', userId)
    console.log('📝 Query Details: SELECT profiles with student_profiles, user_interests, user_skills')
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        bio,
        location,
        tagline,
        professional_summary,
        profile_image_url,
        cover_image_url,
        timezone,
        availability_status,
        role,
        student_profiles (
          education_level,
          age_group,
          birth_month,
          birth_year,
          personality_type,
          learning_style,
          favorite_quote
        ),
        user_interests (
          interests (
            id,
            name,
            interest_categories (
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
              name
            )
          )
        )
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Error fetching profile:', error)
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('✅ Supabase Query Result: Found profile for user:', userId)

    // Transform the response to match the expected structure (camelCase)
    const formattedProfile = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      bio: profile.bio,
      location: profile.location,
      tagline: profile.tagline,
      professionalSummary: profile.professional_summary,
      profileImageUrl: profile.profile_image_url,
      coverImageUrl: profile.cover_image_url,
      timezone: profile.timezone,
      availabilityStatus: profile.availability_status,
      role: profile.role,
      // Student-specific fields (if student profile exists)
      ...(profile.student_profiles && profile.student_profiles.length > 0 && {
        educationLevel: profile.student_profiles[0].education_level,
        ageGroup: profile.student_profiles[0].age_group,
        birthMonth: profile.student_profiles[0].birth_month,
        birthYear: profile.student_profiles[0].birth_year,
        personalityType: profile.student_profiles[0].personality_type,
        learningStyle: profile.student_profiles[0].learning_style,
        favoriteQuote: profile.student_profiles[0].favorite_quote
      }),
      // Include interests and skills
      interests: profile.user_interests?.map(ui => ({
        id: ui.interests.id,
        name: ui.interests.name,
        category: ui.interests.interest_categories?.name || 'Uncategorized'
      })) || [],
      skills: profile.user_skills?.map(us => ({
        id: us.skills.id,
        name: us.skills.name,
        category: us.skills.skill_categories?.name || 'Uncategorized',
        level: us.proficiency_level
      })) || []
    }

    console.log('📊 Personal Info API Result: Successfully formatted profile data')

    const response = NextResponse.json(formattedProfile)
    
    // Add cache headers to reduce unnecessary requests
    response.headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300')

    return response
  } catch (error) {
    console.error('❌ Error fetching personal info:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🎯 PUT /api/profile/personal-info - Request received')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')

    if (!token) {
      // Try to get token from cookies as fallback
      const authCookie = request.cookies.get('sb-access-token')?.value ||
                        request.cookies.get('sb-refresh-token')?.value

      if (authCookie) {
        token = authCookie
      }
    }

    if (!token) {
      console.log('❌ PUT /api/profile/personal-info - No token found')
      return NextResponse.json({ error: 'Unauthorized - no access token' }, { status: 401 })
    }

    // Verify the user
    const { data: authData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !authData.user) {
      console.log('❌ PUT /api/profile/personal-info - Auth verification failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized - invalid token' }, { status: 401 })
    }

    const userId = authData.user.id
    const body = await request.json()

    console.log('✅ PUT /api/profile/personal-info - User authenticated:', userId)
    console.log('📝 Update data received:', Object.keys(body))

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      console.log('❌ PUT /api/profile/personal-info - Missing required fields')
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Separate profile data from student-specific data
    const {
      educationLevel,
      ageGroup,
      birthMonth,
      birthYear,
      personalityType,
      learningStyle,
      favoriteQuote,
      ...profileData
    } = body

    // Update main profile using direct Supabase query
    console.log('🔍 Supabase Query: Updating main profile')
    console.log('📝 Query Details: UPDATE profiles SET ... WHERE id = ?')
    
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
        bio: profileData.bio?.trim() || null,
        location: profileData.location?.trim() || null,
        tagline: profileData.tagline || null,
        professional_summary: profileData.professionalSummary || null,
        profile_image_url: profileData.profileImageUrl || null,
        cover_image_url: profileData.coverImageUrl || null,
        timezone: profileData.timezone || null,
        availability_status: profileData.availabilityStatus || null,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Error updating profile:', profileError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    console.log('✅ Supabase Query Result: Profile updated successfully')

    // Update student profile if student-specific data is provided and user is a student
    if (updatedProfile.role === 'student' && 
        (educationLevel || ageGroup || birthMonth || birthYear || personalityType || learningStyle || favoriteQuote)) {

      console.log('🔍 Supabase Query: Updating student profile')
      console.log('📝 Query Details: UPDATE student_profiles SET ... WHERE id = ?')

      // Calculate age group from birth data if available
      const calculateAgeGroup = (birthMonth: string, birthYear: string): string => {
        if (!birthMonth || !birthYear) return "young_adult"

        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1

        const birthYearNum = parseInt(birthYear)
        const birthMonthNum = parseInt(birthMonth)

        let ageInYears = currentYear - birthYearNum
        if (currentMonth < birthMonthNum) {
          ageInYears--
        }

        if (ageInYears < 5) {
          return "early_childhood"
        } else if (ageInYears < 11) {
          return "elementary"
        } else if (ageInYears < 13) {
          return "middle_school"
        } else if (ageInYears < 18) {
          return "high_school"
        } else {
          return "young_adult"
        }
      }

      // Get existing student profile to access birth data if needed
      const { data: existingStudentProfile } = await supabase
        .from('student_profiles')
        .select('birth_month, birth_year')
        .eq('id', userId)
        .single()

      const currentBirthMonth = birthMonth || existingStudentProfile?.birth_month || ""
      const currentBirthYear = birthYear || existingStudentProfile?.birth_year || ""
      const calculatedAgeGroup = calculateAgeGroup(currentBirthMonth, currentBirthYear)

      const { data: updatedStudentProfile, error: studentError } = await supabase
        .from('student_profiles')
        .update({
          education_level: educationLevel || null,
          age_group: calculatedAgeGroup, // Use calculated age group
          birth_month: birthMonth || null,
          birth_year: birthYear || null,
          personality_type: personalityType || null,
          learning_style: learningStyle || null,
          favorite_quote: favoriteQuote || null,
          updated_at: new Date()
        })
        .eq('id', userId)
        .select()
        .single()

      if (studentError) {
        console.error('❌ Error updating student profile:', studentError)
        return NextResponse.json({ error: 'Failed to update student profile' }, { status: 500 })
      }

      console.log('✅ Supabase Query Result: Student profile updated successfully')
    }

    console.log('✅ PUT /api/profile/personal-info - All updates completed successfully')

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error('❌ Error updating personal info:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    )
  }
}
