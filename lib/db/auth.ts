import { supabase } from '../supabase'
import { calculateAge } from '../utils'
import { sendEmail } from '../email'

export type UserRegistrationData = {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'student' | 'mentor' | 'institution'
  birthMonth?: string
  birthYear?: string
  parentEmail?: string
  profession?: string
  organization?: string
}

async function checkEmailExists(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error
  }

  return !!data
}

async function sendParentApprovalEmail(studentEmail: string, parentEmail: string) {
  const approvalToken = Buffer.from(`${studentEmail}:${Date.now()}`).toString('base64')
  const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL}/approve-student?token=${approvalToken}`

  return sendEmail('parent-approval', parentEmail, {
    studentEmail,
    approvalLink
  })
}

export async function registerUser(data: UserRegistrationData) {
  try {
    console.log('Starting user registration process for:', data.email)

    // Check if email exists
    const emailExists = await checkEmailExists(data.email)
    if (emailExists) {
      console.error('Registration failed: Email already exists:', data.email)
      return { success: false, error: 'Email already exists' }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role
        },
        emailRedirectTo: `${window.location.origin}/onboarding`
      }
    })

    if (authError) {
      console.error('Registration failed: Auth error:', authError)
      throw authError
    }

    if (!authData.user) {
      console.error('Registration failed: No user data returned from auth')
      throw new Error('No user data returned from auth')
    }

    console.log('Auth user created successfully:', authData.user.id)

    // Set auth context for subsequent operations
    supabase.auth.setSession({
      access_token: authData.session?.access_token || '',
      refresh_token: authData.session?.refresh_token || ''
    });

    // Create profile with auth user ID
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        role: data.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Registration failed: Profile creation error:', profileError)
      throw profileError
    }

    console.log('User profile created successfully')

    // Handle role-specific logic
    if (data.role === 'student') {
      if (!data.birthMonth || !data.birthYear) {
        console.error('Registration failed: Birth month and year required for students')
        throw new Error('Birth month and year required for students')
      }

      const totalMonths = calculateAge(parseInt(data.birthMonth), parseInt(data.birthYear))
      const needsParentApproval = totalMonths < 192 // 16 years

      // Get user profile to ensure we have the correct ID
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (profileFetchError) {
        console.error('Failed to fetch profile:', profileFetchError);
        throw profileFetchError;
      }

      const { error: studentError } = await supabase
        .from('student_profiles')
        .insert([{
            id: profileData.id, // Use the confirmed profile ID
            birth_month: parseInt(data.birthMonth),
            birth_year: parseInt(data.birthYear),
            onboarding_completed: false
          }]);

        if (studentError) {
          console.error('Student profile insert error:', studentError);
          throw studentError;
        }

        // Create parent relation if needed
        if (needsParentApproval && data.parentEmail) {
          const { error: parentRelationError } = await supabase
            .from('parent_child_relations')
            .insert([{
              student_id: authData.user.id,
              parent_email: data.parentEmail,
              approval_status: 'pending'
            }]);

          if (parentRelationError) {
            console.error('Parent relation insert error:', parentRelationError);
            throw parentRelationError;
          }

        try {
          await sendParentApprovalEmail(data.email, data.parentEmail)
          console.log('Parent approval email sent successfully')
        } catch (emailError) {
          console.error('Warning: Failed to send parent approval email:', emailError)
          // Continue registration process despite email failure
        }
      }

      return {
        success: true,
        user: authData.user,
        needsParentApproval,
        parentEmail: data.parentEmail
      }
    } else if (data.role === 'mentor') {
      const { error: mentorError } = await supabase
        .from('mentor_profiles')
        .insert([{
          id: authData.user.id,
          profession: data.profession,
          organization: data.organization || null,
          onboarding_completed: false
        }])

      if (mentorError) {
        console.error('Registration failed: Mentor profile creation error:', mentorError)
        throw mentorError
      }

      console.log('Mentor profile created successfully')
      return { success: true, user: authData.user }
    }

    return { success: true, user: authData.user }
  } catch (error: any) {
    console.error('Registration failed:', error)
    return {
      success: false,
      error: error.message || 'Registration failed'
    }
  }
}