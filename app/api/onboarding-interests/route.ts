import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Get the access token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client and verify token
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const ageGroupParam = searchParams.get("ageGroup");

    // Get user's role for age group determination
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1);

    if (profileError || !profileData || profileData.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let ageGroup = null;

    // For parent requests, validate parent profile and use provided age group
    if (parentId) {
      // For parent requests, use the provided age group parameter
      ageGroup = ageGroupParam;
    } else if (profileData[0].role === "student") {
      // Get student's age group
      const { data: studentProfileData, error: studentProfileError } = await supabase
        .from('student_profiles')
        .select('age_group')
        .eq('id', user.id)
        .limit(1);

      if (!studentProfileError && studentProfileData && studentProfileData.length > 0) {
        ageGroup = studentProfileData[0].age_group;
      }
    }

    if (!ageGroup) {
      return NextResponse.json(
        { error: "Age group not found" },
        { status: 400 },
      );
    }

    // Fetch interest categories and interests for the specified age group
    console.log(
      "🔍 Supabase Query: Fetching interest categories and interests for age group:",
      ageGroup,
    );

    const { data: categoriesWithInterests, error: queryError } = await supabase
      .from('interest_categories')
      .select(`
        id,
        name,
        interests (
          id,
          name
        )
      `)
      .eq('age_group', ageGroup)
      .order('name', { ascending: true });

    if (queryError) {
      console.error("Supabase query error:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch interests" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Supabase Result: Found",
      categoriesWithInterests?.length || 0,
      "categories",
    );

    // Transform the data to match the expected format
    const formattedCategories = categoriesWithInterests?.map(category => ({
      name: category.name,
      interests: (category.interests || [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(interest => ({
          id: interest.id,
          name: interest.name,
        }))
    })) || [];

    return NextResponse.json(formattedCategories);
  } catch (error) {
    console.error("Error fetching interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch interests" },
      { status: 500 },
    );
  }
}