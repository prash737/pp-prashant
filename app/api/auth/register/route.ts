
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { db } from '@/lib/db/drizzle'
import { profiles, studentProfiles, mentorProfiles, institutionProfiles, institutionTypes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { calculateAge } from '@/lib/utils'
import { sendEmail } from '@/lib/email'

interface UserRegistrationData {
  firstName: string
  lastName: string
  email: string
  password: string
  birthMonth?: string
  birthYear?: string
  parentEmail?: string
  parentName?: string
  role: "student" | "mentor" | "institution"
  institutionData?: {
    institutionName: string
    institutionTypeId: number
    category: string
    website: string
    logoUrl: string
    coverImageUrl: string
    description: string
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('🔐 [API] Registration request started')
  
  try {
    const body: UserRegistrationData = await request.json()
    const { role, institutionData, ...userData } = body

    console.log('🔐 [API] Registration attempt for role:', role, 'email:', userData.email?.substring(0, 5) + '***')

    // Step 1: Create Supabase auth user
    const supabase = createClient()
    const authStartTime = Date.now()
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: role,
      },
    })

    const authDuration = Date.now() - authStartTime
    console.log(`🔐 [API] Supabase auth completed in ${authDuration}ms`)

    if (authError || !authData.user) {
      console.log('🔐 [API] Authentication failed:', authError?.message)
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Step 2: Create profile using Drizzle
    const dbStartTime = Date.now()
    
    const [profile] = await db
      .insert(profiles)
      .values({
        id: authData.user.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: role,
        onboardingCompleted: false,
      })
      .returning()

    console.log('🔐 [API] Profile created:', profile.id)

    // Step 3: Create role-specific profile
    if (role === 'student') {
      // Calculate age and handle parent approval
      const age = (userData.birthYear && userData.birthMonth) ? 
        Math.floor(calculateAge(parseInt(userData.birthMonth), parseInt(userData.birthYear)) / 12) : null
      const needsParentApproval = age !== null && age < 16

      const calculateAgeGroup = (birthMonth: string | null, birthYear: string | null): string => {
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

        if (ageInYears < 5) return "early_childhood"
        else if (ageInYears < 11) return "elementary"
        else if (ageInYears < 13) return "middle_school"
        else if (ageInYears < 18) return "high_school"
        else return "young_adult"
      }

      const calculatedAgeGroup = calculateAgeGroup(userData.birthMonth || "", userData.birthYear || "")

      await db
        .insert(studentProfiles)
        .values({
          id: profile.id,
          ageGroup: calculatedAgeGroup,
          educationLevel: "undergraduate",
          birthMonth: userData.birthMonth || null,
          birthYear: userData.birthYear || null,
          onboardingCompleted: false,
        })

      // Handle parent verification emails if needed
      if (needsParentApproval && userData.parentEmail) {
        try {
          const baseUrl = 'https://pathpiper.com'
          const verificationToken = Buffer.from(`${userData.parentEmail}:${authData.user.id}:${Date.now()}`).toString('base64')
          const verificationLink = `${baseUrl}/api/auth/verify-parent?token=${verificationToken}`

          await sendEmail('parent-approval-new', userData.parentEmail, {
            studentName: `${userData.firstName} ${userData.lastName}`,
            approvalLink: verificationLink
          })
          console.log('📧 Parent verification email sent')
        } catch (emailError) {
          console.error('❌ Failed to send parent verification email:', emailError)
        }
      }

      const dbDuration = Date.now() - dbStartTime
      console.log(`🔐 [API] Student registration completed in ${dbDuration}ms`)

      return NextResponse.json({
        success: true,
        needsParentApproval,
        parentEmail: userData.parentEmail,
        userId: authData.user.id,
      })

    } else if (role === 'mentor') {
      await db
        .insert(mentorProfiles)
        .values({
          id: profile.id,
          profession: "Not specified",
          verified: false,
          onboardingCompleted: false,
        })

      const dbDuration = Date.now() - dbStartTime
      console.log(`🔐 [API] Mentor registration completed in ${dbDuration}ms`)

      return NextResponse.json({
        success: true,
        userId: authData.user.id,
      })

    } else if (role === 'institution' && institutionData) {
      // Validate institution type
      const [institutionType] = await db
        .select()
        .from(institutionTypes)
        .where(eq(institutionTypes.id, institutionData.institutionTypeId))
        .limit(1)

      if (!institutionType) {
        return NextResponse.json(
          { success: false, error: 'Invalid institution type selected' },
          { status: 400 }
        )
      }

      await db
        .insert(institutionProfiles)
        .values({
          id: profile.id,
          institutionName: institutionData.institutionName,
          institutionType: institutionType.name,
          institutionTypeId: institutionData.institutionTypeId,
          website: institutionData.website || null,
          logoUrl: institutionData.logoUrl || null,
          coverImageUrl: institutionData.coverImageUrl || null,
          verified: false,
          onboardingCompleted: true,
        })

      const dbDuration = Date.now() - dbStartTime
      console.log(`🔐 [API] Institution registration completed in ${dbDuration}ms`)

      return NextResponse.json({
        success: true,
        userId: authData.user.id,
      })
    }

    const totalDuration = Date.now() - startTime
    console.log(`🔐 [API] Registration completed successfully in ${totalDuration}ms`)

    return NextResponse.json({
      success: true,
      userId: authData.user.id,
    })

  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error('🔐 [API] Registration error after', totalDuration + 'ms:', error)
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
