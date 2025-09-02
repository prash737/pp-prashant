
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Check for valid session cookie
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get("sb-access-token");
    const parentAuthTokenCookie = cookieStore.get("parent-auth-token");

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a parent or regular user request
    let isParentRequest = false;

    if (parentAuthTokenCookie) {
      // Parent authentication - validate parent profile
      try {
        const parentId = parentAuthTokenCookie.value;
        
        // Check if parent profile exists
        const { data: parentProfile, error: parentError } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('id', parentId)
          .limit(1);

        if (parentError || !parentProfile || parentProfile.length === 0) {
          return NextResponse.json(
            { error: "Invalid parent session" },
            { status: 401 },
          );
        }

        isParentRequest = true;
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid parent session" },
          { status: 401 },
        );
      }
    } else if (!accessTokenCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    } else {
      // Verify the access token is valid for regular users
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(accessTokenCookie.value);

        if (error || !user) {
          console.log("⚠️ Invalid access token for onboarding-skills API");
          return NextResponse.json(
            { error: "Invalid session" },
            { status: 401 },
          );
        }
      } catch (error) {
        console.error("Error verifying access token:", error);
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const ageGroup = searchParams.get("ageGroup");

    if (!ageGroup) {
      return NextResponse.json(
        { error: "Age group is required" },
        { status: 400 },
      );
    }

    console.log("🔍 Fetching skill categories for age group:", ageGroup);

    // Map age group names for compatibility
    let mappedAgeGroup = ageGroup;
    if (ageGroup.includes("-")) {
      mappedAgeGroup = ageGroup.replace(/-/g, "_");
    }
    console.log("🔍 Original age group:", ageGroup);
    console.log("🔍 Mapped age group:", mappedAgeGroup);

    // Fetch skill categories and skills for the age group using direct Supabase query
    const { data: skillCategoriesWithSkills, error: queryError } = await supabase
      .from('skill_categories')
      .select(`
        id,
        name,
        age_group,
        skills (
          id,
          name
        )
      `)
      .eq('age_group', mappedAgeGroup)
      .order('name', { ascending: true });

    if (queryError) {
      console.error("Supabase query error:", queryError);
      return NextResponse.json(
        { error: "Failed to fetch skill categories" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Found",
      skillCategoriesWithSkills?.length || 0,
      "skill categories for age group:",
      mappedAgeGroup,
    );

    // If no categories found for this age group, try with a fallback
    let finalCategories = skillCategoriesWithSkills || [];
    if (!skillCategoriesWithSkills || skillCategoriesWithSkills.length === 0) {
      console.log(
        "⚠️ No categories found for",
        mappedAgeGroup,
        ", trying young_adult as fallback",
      );
      
      const { data: fallbackCategories, error: fallbackError } = await supabase
        .from('skill_categories')
        .select(`
          id,
          name,
          age_group,
          skills (
            id,
            name
          )
        `)
        .eq('age_group', 'young_adult')
        .order('name', { ascending: true });

      if (fallbackError) {
        console.error("Supabase fallback query error:", fallbackError);
        return NextResponse.json(
          { error: "Failed to fetch fallback skill categories" },
          { status: 500 },
        );
      }

      finalCategories = fallbackCategories || [];
      console.log("✅ Found", finalCategories.length, "fallback categories");
    }

    // Transform the data to match the expected format
    const transformedCategories = finalCategories.map((category) => ({
      name: category.name,
      skills: (category.skills || [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((skill) => ({
          id: skill.id,
          name: skill.name,
        }))
    }));

    console.log(
      "✅ Transformed categories:",
      transformedCategories.map((c) => ({
        name: c.name,
        skillCount: c.skills.length,
      })),
    );

    return NextResponse.json({ categories: transformedCategories });
  } catch (error) {
    console.error("Error in GET /api/onboarding-skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
