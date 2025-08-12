import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Database connection will be tested when actually needed

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log("⏱️ [AUTH-USER] Request started");

  try {
    // Simplified approach: Try to get user directly from database
    // First try the cookie-based approach (for production)
    console.log("API: Checking cookies for auth token");

    // Try to get token from cookies or auth header
    const authStart = Date.now();
    const authHeader = request.headers.get('Authorization');
    const cookieString = request.headers.get('cookie') || '';
    console.log(`⏱️ [AUTH-USER] Cookie parsing started at ${authStart - startTime}ms`);

    // Parse cookies properly
    const cookies = Object.fromEntries(
      cookieString.split(';').map(cookie => {
        const [name, ...rest] = cookie.trim().split('=');
        return [name, decodeURIComponent(rest.join('='))];
      })
    );

    console.log("API: Available cookies:", Object.keys(cookies).join(', '));

    // Log all available cookies for debugging
    console.log("API: Available cookies:", Object.keys(cookies));
    console.log("API: Looking for session cookies...");

    // Prioritize auth header, then look for our new session cookies
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("API: Using token from Authorization header");
    } else {
      // First try our new access token cookie
      if (cookies['sb-access-token']) {
        token = cookies['sb-access-token'];
        console.log("API: Using access token from sb-access-token cookie");
      } else {
        // Fallback to looking for other Supabase session cookies
        const sbAuthTokens = Object.keys(cookies).filter(key => 
          key.startsWith('sb-') && (key.includes('auth-token') || key.includes('access'))
        );

        console.log("API: Found potential auth cookies:", sbAuthTokens);

        for (const cookieName of sbAuthTokens) {
          try {
            const cookieValue = cookies[cookieName];
            console.log(`API: Checking cookie ${cookieName} (length: ${cookieValue?.length || 0})`);

            // Try to parse as JSON if it looks like a session object
            if (cookieValue.startsWith('[') || cookieValue.startsWith('{')) {
              const parsed = JSON.parse(cookieValue);
              if (parsed && parsed.access_token) {
                token = parsed.access_token;
                console.log(`API: Extracted access_token from ${cookieName}`);
                break;
              }
            } else if (cookieValue.includes('.')) {
              // If it looks like a JWT (has dots), use it directly
              token = cookieValue;
              console.log(`API: Using JWT token from ${cookieName}`);
              break;
            }
          } catch (parseError) {
            console.log(`API: Failed to parse cookie ${cookieName}:`, parseError instanceof Error ? parseError.message : String(parseError));
          }
        }
      }
    }

    console.log("API: Token found:", !!token);
    if (token) {
      console.log("API: Token preview:", token.substring(0, 30) + "...");
    }

    // If no access token found, try to use refresh token to get a new session
    let refreshData = null;
    if (!token && cookies['sb-refresh-token']) {
      console.log("API: No access token found, attempting to refresh session");
      try {
        const refreshResult = await supabase.auth.refreshSession({
          refresh_token: cookies['sb-refresh-token']
        });
        refreshData = refreshResult.data;
        const refreshError = refreshResult.error;

        if (refreshData?.session?.access_token) {
          token = refreshData.session.access_token;
          console.log("API: Successfully refreshed access token");
        } else {
          console.log("API: Failed to refresh session:", refreshError?.message);
        }
      } catch (refreshErr) {
        console.log("API: Error during token refresh:", refreshErr);
      }
    }

    if (token) {
      console.log("API: Token preview:", token.substring(0, 20) + "...");

      // Try to verify the token with Supabase
      console.log("API: Verifying token with Supabase");
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser(token);

        if (authError) {
          console.log("API: Supabase auth error:", authError.message);
          // Even if auth fails, try a direct query as fallback
        } else if (authData && authData.user) {
          console.log("API: Authenticated user found:", authData.user.id);

          // Query the database for the user profile
          const dbStart = Date.now();
          console.log(`⏱️ [AUTH-USER] Database query starting at ${dbStart - startTime}ms`);
          const userProfile = await prisma.profile.findUnique({
            where: { id: authData.user.id },
            include: {
              student: true,
              mentor: true,
              institution: true
            }
          });

          if (userProfile) {
            console.log(`⏱️ [AUTH-USER] Database query completed in ${Date.now() - dbStart}ms`);
            console.log("API: User profile found in database");
            console.log("API: Raw age_group from database:", userProfile.student?.age_group);
            // Format birth month and year for display
            let birthMonth = "";
            let birthYear = "";

            if (userProfile.student) {
              birthMonth = userProfile.student.birthMonth ? userProfile.student.birthMonth.toString() : "";
              birthYear = userProfile.student.birthYear ? userProfile.student.birthYear.toString() : "";
            }
            const responseData = {
              user: {
                id: userProfile.id,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: authData.user.email,
                role: userProfile.role,
                bio: userProfile.bio,
                location: userProfile.location,
                profileImageUrl: userProfile.profileImageUrl,
                // Add student-specific data if this is a student
                ...(userProfile.student && {
                  educationLevel: userProfile.student.educationLevel,
                  onboardingCompleted: userProfile.student.onboardingCompleted ?? true, // Default to true if null
                  birthMonth: birthMonth,
                  birthYear: birthYear,
                  ageGroup: userProfile.student.age_group, // Return exactly as stored in DB
                }),
                // Add mentor-specific data if this is a mentor
                ...(userProfile.mentor && {
                  profession: userProfile.mentor.profession,
                  organization: userProfile.mentor.organization,
                  yearsExperience: userProfile.mentor.yearsExperience,
                  onboardingCompleted: userProfile.mentor.onboardingCompleted
                }),
                // Add institution-specific data if this is an institution
                ...(userProfile.institution && {
                  institutionName: userProfile.institution.institutionName,
                  institutionType: userProfile.institution.institutionType,
                  institutionTypeId: userProfile.institution.institutionTypeId,
                  website: userProfile.institution.website,
                  onboardingCompleted: userProfile.institution.onboardingCompleted
                })
              }
            };

            // If we refreshed the token, set the cookie and return the response with the cookie
            if (refreshData?.session?.access_token) {
              const response = NextResponse.json(responseData);
              response.cookies.set('sb-access-token', refreshData.session.access_token, {
                httpOnly: true,
                secure: true, // Always secure in production
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/'
              });
              if (refreshData.session.refresh_token) {
                response.cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
                  httpOnly: true,
                  secure: true,
                  sameSite: 'lax',
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                });
              }
              return response;
            } else {
              console.log(`✅ [AUTH-USER] Request completed in ${Date.now() - startTime}ms`);
              return NextResponse.json(responseData);
            }
          } else {
            console.log("API: User authenticated but no profile found");
          }
        }
      } catch (err) {
        console.error("API: Error verifying token:", err);
      }
    }

    // If we reach here, we couldn't authenticate or find any profile
    return NextResponse.json(
      { error: "Unauthorized or no profile found" },
      { status: 401 }
    );
  } catch (error) {
    console.error("API: Unexpected error in user route:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    console.log("API: Profile update request received");

    // Get the request body
    const body = await request.json();
    console.log("API: Update data:", body);

    // Get user from session cookie - properly await cookies() for NextJS 15
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      console.log("API: No access token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log("API: Invalid token or user not found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("API: Authenticated user:", user.id);

    // Extract profile data from the nested structure
    const profileData = body.profile || body;

    // Update profile data
    if (profileData) {
      console.log('Updating profile with data:', profileData);

      const profileUpdateData: any = {};
      if (profileData.firstName !== undefined) profileUpdateData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) profileUpdateData.lastName = profileData.lastName;
      if (profileData.bio !== undefined) profileUpdateData.bio = profileData.bio;
      if (profileData.location !== undefined) profileUpdateData.location = profileData.location;
      if (profileData.tagline !== undefined) profileUpdateData.tagline = profileData.tagline;
      // Note: onboarding_completed field has been removed from Profile model
        // Onboarding completion is now determined by data presence for students
        // and stored in role-specific profile tables for mentors/institutions

      console.log('Profile update data being sent to database:', profileUpdateData);

      const updatedProfile = await prisma.profile.update({
        where: { id: user.id },
        data: profileUpdateData
      });

      console.log("API: Profile updated successfully");

      // If user is a student, also update student profile
      if (profileData.educationLevel || profileData.birthMonth || profileData.birthYear || profileData.ageGroup) {
      const studentUpdateData: any = {};

      if (profileData.educationLevel) {
        studentUpdateData.educationLevel = profileData.educationLevel;
      }
      if (profileData.birthMonth) {
        studentUpdateData.birthMonth = profileData.birthMonth;
      }
      if (profileData.birthYear) {
        studentUpdateData.birthYear = profileData.birthYear;
      }
      if (profileData.ageGroup) {
        studentUpdateData.age_group = profileData.ageGroup;
      }

      await prisma.studentProfile.update({
        where: { id: user.id },
        data: studentUpdateData
      });
      console.log("API: Student profile updated successfully");
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedProfile.id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        bio: updatedProfile.bio,
        location: updatedProfile.location,
      }
    });
    }

    // If no profile data to update
    return NextResponse.json({
      success: false,
      error: 'No profile data provided'
    }, { status: 400 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}