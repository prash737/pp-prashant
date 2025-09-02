
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

    // Get user's role
    console.log(
      "🔍 Supabase Query: Fetching user role for user:",
      user.id,
    );
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("✅ Supabase Result: Found user role:", profile.role);

    let ageGroup = null;

    if (profile.role === "student") {
      // Get student's age group
      console.log(
        "🔍 Supabase Query: Fetching age group for student:",
        user.id,
      );
      const { data: studentProfile, error: studentError } = await supabase
        .from('student_profiles')
        .select('age_group')
        .eq('id', user.id)
        .limit(1)
        .single();

      if (studentProfile && !studentError) {
        ageGroup = studentProfile.age_group;
        console.log("✅ Supabase Result: Found age group:", ageGroup);
      }
    }

    if (!ageGroup) {
      return NextResponse.json(
        { error: "Age group not found" },
        { status: 400 },
      );
    }

    // Get available interest categories for age group filtering
    console.log(
      "🔍 Supabase Query: Fetching available categories for age group:",
      ageGroup,
    );
    const { data: availableCategories, error: categoriesError } = await supabase
      .from('interest_categories')
      .select('id, name')
      .eq('age_group', ageGroup);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Supabase Result: Found",
      availableCategories?.length || 0,
      "available categories",
    );

    const availableInterestNames = new Set();
    for (const category of availableCategories || []) {
      console.log(
        "🔍 Supabase Query: Fetching interests for category:",
        category.name,
        "ID:",
        category.id,
      );
      const { data: categoryInterests, error: interestsError } = await supabase
        .from('interests')
        .select('name')
        .eq('category_id', category.id);

      if (!interestsError && categoryInterests) {
        console.log(
          "✅ Supabase Result: Found",
          categoryInterests.length,
          "interests for category:",
          category.name,
        );
        categoryInterests.forEach((interest) => {
          availableInterestNames.add(interest.name);
        });
      }
    }

    // Get user's current interests with details
    console.log(
      "🔍 Supabase Query: Fetching current user interests for user:",
      user.id,
    );
    const { data: currentUserInterests, error: userInterestsError } = await supabase
      .from('user_interests')
      .select(`
        id,
        interest_id,
        interests!inner(
          id,
          name,
          category_id
        )
      `)
      .eq('user_id', user.id);

    if (userInterestsError) {
      console.error("Error fetching user interests:", userInterestsError);
      return NextResponse.json(
        { error: "Failed to fetch user interests" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Supabase Result: Found",
      currentUserInterests?.length || 0,
      "current user interests",
    );

    // Get all available interests for user's current age group
    console.log(
      "🔍 Supabase Query: Fetching all available interests for age group:",
      ageGroup,
    );
    const { data: availableInterests, error: availableInterestsError } = await supabase
      .from('interests')
      .select(`
        id,
        name,
        category_id,
        interest_categories!inner(
          age_group
        )
      `)
      .eq('interest_categories.age_group', ageGroup);

    if (availableInterestsError) {
      console.error("Error fetching available interests:", availableInterestsError);
      return NextResponse.json(
        { error: "Failed to fetch available interests" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Supabase Result: Found",
      availableInterests?.length || 0,
      "available interests for age group",
    );

    // Filter valid interests (those that exist in current age group)
    const validInterests = (currentUserInterests || []).filter((userInterest) =>
      availableInterestNames.has(userInterest.interests.name),
    );

    // Find invalid interests to cleanup
    const invalidInterestIds = (currentUserInterests || [])
      .filter(
        (userInterest) =>
          !availableInterestNames.has(userInterest.interests.name),
      )
      .map((userInterest) => userInterest.interest_id);

    // Cleanup invalid interests if any exist
    if (invalidInterestIds.length > 0) {
      console.log(
        "🗑️ Supabase Query: Cleaning up",
        invalidInterestIds.length,
        "invalid interests for user:",
        user.id,
      );
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .in('interest_id', invalidInterestIds);

      if (deleteError) {
        console.error("Error cleaning up invalid interests:", deleteError);
      } else {
        console.log("✅ Supabase Result: Cleaned up invalid interests");
      }
    }

    // Format response to match frontend expectations
    const formattedInterests = validInterests.map((userInterest) => ({
      id: userInterest.interests.id,
      name: userInterest.interests.name,
      categoryId: userInterest.interests.category_id,
    }));

    return NextResponse.json({ interests: formattedInterests });
  } catch (error) {
    console.error("Error fetching user interests:", error);
    return NextResponse.json(
      { error: "Failed to fetch user interests" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { interests: selectedInterests } = await request.json();

    if (!Array.isArray(selectedInterests)) {
      return NextResponse.json(
        { error: "Invalid interests format" },
        { status: 400 },
      );
    }

    // Get user's role and age group
    console.log(
      "🔍 Supabase Query: [POST] Fetching user role for user:",
      user.id,
    );
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let ageGroup = null;

    if (profile.role === "student") {
      console.log(
        "🔍 Supabase Query: [POST] Fetching age group for student:",
        user.id,
      );
      const { data: studentProfile, error: studentError } = await supabase
        .from('student_profiles')
        .select('age_group')
        .eq('id', user.id)
        .limit(1)
        .single();

      if (studentProfile && !studentError) {
        ageGroup = studentProfile.age_group;
        console.log("✅ Supabase Result: [POST] Found age group:", ageGroup);
      }
    }

    if (!ageGroup) {
      return NextResponse.json(
        { error: "Age group not found" },
        { status: 400 },
      );
    }

    // Get available interests for user's age group
    console.log(
      "🔍 Supabase Query: [POST] Fetching available interests for age group:",
      ageGroup,
    );
    const { data: availableInterests, error: availableInterestsError } = await supabase
      .from('interests')
      .select(`
        id,
        name,
        interest_categories!inner(
          age_group
        )
      `)
      .eq('interest_categories.age_group', ageGroup);

    if (availableInterestsError) {
      console.error("Error fetching available interests:", availableInterestsError);
      return NextResponse.json(
        { error: "Failed to fetch available interests" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Supabase Result: [POST] Found",
      availableInterests?.length || 0,
      "available interests",
    );

    const availableInterestMap = new Map();
    (availableInterests || []).forEach((interest) => {
      availableInterestMap.set(interest.name, interest.id);
    });

    // Get or create custom interest category for this age group
    console.log(
      "🔍 Supabase Query: [POST] Looking for Custom category for age group:",
      ageGroup,
    );
    let { data: customCategory, error: customCategoryError } = await supabase
      .from('interest_categories')
      .select('id')
      .eq('name', 'Custom')
      .eq('age_group', ageGroup)
      .limit(1)
      .single();

    let customCategoryId;

    if (customCategoryError || !customCategory) {
      console.log(
        "🔍 Supabase Query: [POST] Creating new Custom category for age group:",
        ageGroup,
      );
      const { data: newCategory, error: newCategoryError } = await supabase
        .from('interest_categories')
        .insert({
          name: 'Custom',
          age_group: ageGroup,
        })
        .select('id')
        .single();

      if (newCategoryError || !newCategory) {
        console.error("Error creating custom category:", newCategoryError);
        return NextResponse.json(
          { error: "Failed to create custom category" },
          { status: 500 },
        );
      }

      console.log(
        "✅ Supabase Result: [POST] Created Custom category with ID:",
        newCategory.id,
      );
      customCategoryId = newCategory.id;
    } else {
      console.log(
        "✅ Supabase Result: [POST] Found existing Custom category with ID:",
        customCategory.id,
      );
      customCategoryId = customCategory.id;
    }

    // Process interests and create custom ones if needed
    const interestIds = [];

    for (const interestName of selectedInterests) {
      if (availableInterestMap.has(interestName)) {
        // Existing interest
        interestIds.push(availableInterestMap.get(interestName));
      } else {
        // Check if custom interest already exists
        console.log(
          "🔍 Supabase Query: [POST] Checking for existing custom interest:",
          interestName,
        );
        const { data: existingCustom, error: existingCustomError } = await supabase
          .from('interests')
          .select('id')
          .eq('name', interestName)
          .eq('category_id', customCategoryId)
          .limit(1)
          .single();

        if (existingCustom && !existingCustomError) {
          console.log(
            "✅ Supabase Result: [POST] Found existing custom interest:",
            interestName,
            "ID:",
            existingCustom.id,
          );
          interestIds.push(existingCustom.id);
        } else {
          // Create new custom interest
          console.log(
            "🔍 Supabase Query: [POST] Creating new custom interest:",
            interestName,
          );
          const { data: newInterest, error: newInterestError } = await supabase
            .from('interests')
            .insert({
              name: interestName,
              category_id: customCategoryId,
            })
            .select('id')
            .single();

          if (newInterestError || !newInterest) {
            console.error("Error creating custom interest:", newInterestError);
            continue; // Skip this interest if creation fails
          }

          console.log(
            "✅ Supabase Result: [POST] Created custom interest:",
            interestName,
            "ID:",
            newInterest.id,
          );
          interestIds.push(newInterest.id);
        }
      }
    }

    // Get currently saved user interests
    console.log(
      "🔍 Supabase Query: [POST] Fetching currently saved user interests for user:",
      user.id,
    );
    const { data: currentUserInterests, error: currentUserInterestsError } = await supabase
      .from('user_interests')
      .select(`
        id,
        interest_id,
        interests!inner(
          name
        )
      `)
      .eq('user_id', user.id);

    if (currentUserInterestsError) {
      console.error("Error fetching current user interests:", currentUserInterestsError);
      return NextResponse.json(
        { error: "Failed to fetch current user interests" },
        { status: 500 },
      );
    }

    console.log(
      "✅ Supabase Result: [POST] Found",
      currentUserInterests?.length || 0,
      "currently saved interests",
    );

    // Find interests to remove (those not in the new selection)
    const interestsToRemove = (currentUserInterests || []).filter(
      (ui) => !interestIds.includes(ui.interest_id),
    );

    // Remove interests that are no longer selected
    if (interestsToRemove.length > 0) {
      const idsToRemove = interestsToRemove.map((ui) => ui.interest_id);
      console.log(
        "🗑️ Supabase Query: [POST] Removing",
        interestsToRemove.length,
        "interests for user:",
        user.id,
      );
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', user.id)
        .in('interest_id', idsToRemove);

      if (deleteError) {
        console.error("Error removing interests:", deleteError);
      } else {
        console.log("✅ Supabase Result: [POST] Removed interests");
      }
    }

    // Find new interests to add
    const currentInterestIds = (currentUserInterests || []).map((ui) => ui.interest_id);
    const newInterestIds = interestIds.filter(
      (id) => !currentInterestIds.includes(id),
    );

    // Add new interests
    if (newInterestIds.length > 0) {
      const userInterestData = newInterestIds.map((interestId) => ({
        user_id: user.id,
        interest_id: interestId,
      }));

      console.log(
        "➕ Supabase Query: [POST] Adding",
        newInterestIds.length,
        "new interests for user:",
        user.id,
      );
      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(userInterestData);

      if (insertError) {
        console.error("Error adding new interests:", insertError);
      } else {
        console.log("✅ Supabase Result: [POST] Added new interests");
      }
    }

    return NextResponse.json({
      message: "Interests updated successfully",
      added: newInterestIds.length,
      removed: interestsToRemove.length,
    });
  } catch (error) {
    console.error("Error updating user interests:", error);
    return NextResponse.json(
      { error: "Failed to update user interests" },
      { status: 500 },
    );
  }
}
