"use server";

import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client - ONLY for auth operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for Supabase');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthMonth?: string;
  birthYear?: string;
  parentEmail?: string;
  parentName?: string;
  role: "student" | "mentor" | "institution";
}

export async function registerStudent(data: UserRegistrationData) {
  try {
    // Calculate age properly using both birth month and year
    const age = (data.birthYear && data.birthMonth) ? 
      Math.floor(calculateAge(parseInt(data.birthMonth), parseInt(data.birthYear)) / 12) : null;
    const needsParentApproval = age !== null && age < 16;
    
    console.log('🔍 Registration Debug Info:');
    console.log('   - Birth Year:', data.birthYear);
    console.log('   - Calculated Age:', age);
    console.log('   - Needs Parent Approval:', needsParentApproval);
    console.log('   - Parent Email Provided:', data.parentEmail);

    // Step 1: Use Supabase for auth only - create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "student",
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user account");
    }

    // Step 2: Use Prisma for all database operations
    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "student",
      },
    });

    // Calculate age group from birth data
    const calculateAgeGroup = (birthMonth: string | null, birthYear: string | null): string => {
      if (!birthMonth || !birthYear) return "young_adult";

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const birthYearNum = parseInt(birthYear);
      const birthMonthNum = parseInt(birthMonth);

      let ageInYears = currentYear - birthYearNum;
      if (currentMonth < birthMonthNum) {
        ageInYears--;
      }

      if (ageInYears < 5) {
        return "early_childhood";
      } else if (ageInYears < 11) {
        return "elementary";
      } else if (ageInYears < 13) {
        return "middle_school";
      } else if (ageInYears < 18) {
        return "high_school";
      } else {
        return "young_adult";
      }
    };

    const calculatedAgeGroup = calculateAgeGroup(data.birthMonth || "", data.birthYear || "");

    let parentId = null;

    // Handle parent profile creation for students under 16 - ALWAYS create/update parent first
    if (needsParentApproval && data.parentEmail) {
      console.log('🔄 Student needs parent approval - Age:', age, 'Parent Email:', data.parentEmail);
      
      // Check if parent email exists in Supabase auth.users
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const isParentRegistered = existingUsers.users?.some(user => user.email === data.parentEmail) || false;
      console.log('🔍 Parent registered in auth.users:', isParentRegistered);
      
      // Generate verification token with registration status
      const verificationToken = Buffer.from(`${data.parentEmail}:${authData.user.id}:${Date.now()}:${isParentRegistered}`).toString('base64');
      
      // Check if parent profile already exists
      let parentProfile = await prisma.parentProfile.findFirst({
        where: { email: data.parentEmail }
      });

      if (!parentProfile) {
        console.log('✨ Creating new parent profile for:', data.parentEmail);
        // Create new parent profile with verification token
        parentProfile = await prisma.parentProfile.create({
          data: {
            email: data.parentEmail,
            name: data.parentName || "Parent/Guardian",
            verificationToken: verificationToken,
          },
        });
        console.log('✅ Parent profile created with ID:', parentProfile.id);
      } else {
        console.log('🔄 Reusing existing parent profile for:', data.parentEmail);
        console.log('   - Existing parent ID:', parentProfile.id);
        console.log('   - Updating verification token for new child approval');
        // Update existing parent profile with new verification token only
        parentProfile = await prisma.parentProfile.update({
          where: { id: parentProfile.id },
          data: {
            verificationToken: verificationToken
          }
        });
        console.log('✅ Parent profile updated with ID:', parentProfile.id);
      }

      // ENSURE parentId is set
      parentId = parentProfile.id;
      console.log('🎯 Parent ID CONFIRMED set to:', parentId);

      // Send parent verification email with appropriate template
      try {
        // Use the specific PathPiper deployment domain
        const baseUrl = 'https://pathpiper.replit.app';
        
        const verificationLink = `${baseUrl}/api/auth/verify-parent?token=${verificationToken}`;
        console.log('🔗 Base URL:', baseUrl);
        console.log('🔗 Verification link:', verificationLink);
        
        // Use different email template based on parent registration status
        const emailTemplate = isParentRegistered ? 'parent-approval-existing' : 'parent-approval-new';
        
        await sendEmail(
          emailTemplate,
          data.parentEmail,
          {
            studentName: `${data.firstName} ${data.lastName}`,
            approvalLink: verificationLink
          }
        );
        console.log('📧 Parent verification email sent successfully with template:', emailTemplate);
      } catch (emailError) {
        console.error('❌ Failed to send parent verification email:', emailError);
        // Continue with registration even if email fails
      }

      // Send email verification to student (under 16)
      try {
        // Use the specific PathPiper deployment domain
        const baseUrl = 'https://pathpiper.replit.app';
        const studentVerificationToken = Buffer.from(`${data.email}:${authData.user.id}:${Date.now()}`).toString('base64');
        const studentVerificationLink = `${baseUrl}/api/auth/verify-student-email?token=${studentVerificationToken}`;
        
        await sendEmail(
          'student-email-verification',
          data.email,
          {
            studentName: `${data.firstName} ${data.lastName}`,
            verificationLink: studentVerificationLink
          }
        );
        console.log('📧 Student email verification sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send student email verification:', emailError);
        // Continue with registration even if email fails
      }
    }

    // Create student profile
    await prisma.studentProfile.create({
      data: {
        id: profile.id,
        age_group: calculatedAgeGroup,
        educationLevel: "undergraduate", // Default value, can be updated later
        birthMonth: data.birthMonth || null,
        birthYear: data.birthYear || null,
      },
    });
    console.log('✅ Student profile created');

    // Update profile with parent information if needed - THIS MUST HAPPEN
    if (parentId) {
      console.log('🔗 Linking student profile to parent ID:', parentId);
      const updatedProfile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          parent: {
            connect: { id: parentId }
          },
          parentVerified: false,
          email: data.email,
        },
      });
      console.log('✅ Profile updated with parent connection');
    } else {
      console.log('ℹ️ No parent linking required');
      // Still set email for students who don't need parent approval
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          email: data.email,
        },
      });
      console.log('   - needsParentApproval:', needsParentApproval);
      console.log('   - parentEmail provided:', !!data.parentEmail);
      console.log('   - calculated age:', age);
      console.log('   - parentId value:', parentId);
    }

    return {
      success: true,
      needsParentApproval,
      parentEmail: data.parentEmail,
      userId: authData.user.id,
    };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Registration failed",
    };
  }
}

export async function registerMentor(data: UserRegistrationData) {
  try {
    // Step 1: Use Supabase for auth only - create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "mentor",
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user account");
    }

    // Step 2: Use Prisma for all database operations
    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "mentor",
      },
    });

    // Create mentor profile
    await prisma.mentorProfile.create({
      data: {
        id: profile.id,
        profession: "Not specified", // Default value
        verified: false,
      },
    });

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("Registration failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Registration failed",
    };
  }
}

export interface InstitutionRegistrationData extends UserRegistrationData {
  institutionData: {
    institutionName: string;
    institutionTypeId: number | null;
    category: string;
    website: string;
    logoUrl: string;
    coverImageUrl: string;
    description: string;
  };
}

export async function registerInstitution(data: InstitutionRegistrationData) {
  try {
    console.log('🏛️ Starting institution registration:', {
      email: data.email,
      institutionName: data.institutionData.institutionName,
      institutionTypeId: data.institutionData.institutionTypeId
    });

    // Validate required institution data
    if (!data.institutionData.institutionTypeId) {
      throw new Error('Institution type is required');
    }

    // Step 1: Use Supabase for auth only - create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: "institution",
        },
      });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user account");
    }

    console.log('✅ Supabase user created:', authData.user.id);

    // Step 2: Use Prisma for all database operations
    // Create user profile with the Supabase user ID
    const profile = await prisma.profile.create({
      data: {
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "institution",
        email: data.email,
        bio: data.institutionData.description || null,
      },
    });

    console.log('✅ Profile created:', profile.id);

    // First, get the institution type name from the database
    const institutionType = await prisma.institutionType.findUnique({
      where: { id: data.institutionData.institutionTypeId }
    });

    if (!institutionType) {
      throw new Error('Invalid institution type selected');
    }

    // Create institution profile with all required fields matching schema
    await prisma.institutionProfile.create({
      data: {
        id: profile.id,
        institutionName: data.institutionData.institutionName,
        institutionType: institutionType.name, // Store the actual type name
        institutionTypeId: data.institutionData.institutionTypeId, // Store the foreign key ID
        website: data.institutionData.website || null,
        logoUrl: data.institutionData.logoUrl || null,
        coverImageUrl: data.institutionData.coverImageUrl || null,
        verified: false,
        onboardingCompleted: true, // Skip onboarding for institutions
      },
    });

    console.log('✅ Institution profile created successfully');

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("❌ Institution registration failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Registration failed",
    };
  }
}

export interface LoginData {
  email: string;
  password: string;
}

export async function loginUser(data: LoginData) {
  try {
    // Use Supabase Auth for login
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      throw new Error(authError.message || "Login failed");
    }

    if (!authData.user) {
      throw new Error("No user returned from login");
    }

    // Get user's profile with a single optimized query
    // Include the specific profile type based on role to get onboarding status in one query
    const profile = await prisma.profile.findUnique({
      where: { id: authData.user.id },
      include: {
        student: true,
        mentor: true,
        institution: true,
      },
    });

    if (!profile) {
      console.warn(
        `User ${authData.user.id} doesn't have a profile in the database`,
      );
      return {
        success: true,
        user: authData.user,
        role: authData.user.user_metadata?.role || "student",
        onboardingCompleted: false,
      };
    }

    // For students, determine onboarding completion by checking data presence
    let onboardingCompleted = false;
    if (profile.role === 'student') {
      try {
        // Check parent verification and email verification for students under 16
        if (profile.student && profile.student.birthYear && profile.student.birthMonth) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          
          const birthYear = parseInt(profile.student.birthYear);
          const birthMonth = parseInt(profile.student.birthMonth);
          
          let ageInYears = currentYear - birthYear;
          if (currentMonth < birthMonth) {
            ageInYears--;
          }
          
          // Check if student is under 16 and verification status
          if (ageInYears < 16) {
            const isParentVerified = profile.parentVerified || false;
            const isEmailVerified = profile.emailVerified || false;
            
            // Check verification status and return appropriate response
            if (!isParentVerified || !isEmailVerified) {
              return {
                success: false,
                error: "Verification required",
                needsParentApproval: !isParentVerified,
                needsEmailVerification: !isEmailVerified
              };
            }
          }
        }

        // Check if user has minimum required data for all three essential sections
        const hasBasicInfo = !!(profile.firstName && profile.lastName && profile.bio);
        
        // Check interests
        const interests = await prisma.userInterest.findMany({
          where: { userId: profile.id }
        });
        const hasInterests = !!(interests.length > 0);
        
        // Check education
        const education = await prisma.studentEducationHistory.findMany({
          where: { studentId: profile.id }
        });
        const hasEducation = !!(education.length > 0);
        
        onboardingCompleted = hasBasicInfo && hasInterests && hasEducation;
        
        console.log('🔍 Onboarding completion check:', {
          userId: profile.id,
          hasBasicInfo,
          hasInterests: `${interests.length} interests`,
          hasEducation: `${education.length} education entries`,
          onboardingCompleted
        });
      } catch (error) {
        console.error('Error checking onboarding completion:', error);
        onboardingCompleted = false;
      }
    } else if (profile.role === 'mentor' && profile.mentor) {
      onboardingCompleted = profile.mentor.onboardingCompleted || false;
    } else if (profile.role === 'institution' && profile.institution) {
      onboardingCompleted = profile.institution.onboardingCompleted || false;
    }

    return {
      success: true,
      user: authData.user,
      session: authData.session,
      role: profile.role,
      onboardingCompleted,
    };
  } catch (error) {
    console.error("Login failed:", error);
    return {
      success: false,
      error: (error as Error).message || "Login failed",
    };
  }
}