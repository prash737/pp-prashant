
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

    if (!accessTokenCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from session - try API first, fallback to direct validation
    let user;
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`,
        {
          headers: {
            cookie: `sb-access-token=${accessTokenCookie.value}`,
          },
        },
      );

      if (!userResponse.ok) {
        console.log(
          "⚠️ Failed to validate user via API, trying direct Supabase validation",
        );
        // Fallback to direct Supabase validation
        const {
          data: { user: supabaseUser },
          error,
        } = await supabase.auth.getUser(accessTokenCookie.value);

        if (error || !supabaseUser) {
          return NextResponse.json(
            { error: "Invalid session" },
            { status: 401 },
          );
        }

        user = {
          id: supabaseUser.id,
          email: supabaseUser.email,
        };
      } else {
        const result = await userResponse.json();
        user = result.user;
      }
    } catch (error) {
      console.error("Error validating user session for skills get:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("🔍 Fetching skills for user:", user.id);

    // Get user's current skills with skill details using direct Supabase query
    const { data: userSkillsData, error: userSkillsError } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        skills (
          id,
          name,
          skill_categories (
            name,
            age_group
          )
        )
      `)
      .eq('user_id', user.id);

    if (userSkillsError) {
      console.error("Supabase query error:", userSkillsError);
      return NextResponse.json(
        { error: "Failed to fetch user skills" },
        { status: 500 },
      );
    }

    console.log("✅ Found", userSkillsData?.length || 0, "skills for user");

    // Transform to match the expected format
    const transformedSkills = (userSkillsData || []).map((userSkill) => ({
      skill_id: userSkill.skill_id,
      proficiency_level: userSkill.proficiency_level,
      skills: {
        id: userSkill.skills.id,
        name: userSkill.skills.name,
        skill_categories: {
          name: userSkill.skills.skill_categories.name,
          age_group: userSkill.skills.skill_categories.age_group,
        },
      },
    }));

    return NextResponse.json({ skills: transformedSkills });
  } catch (error) {
    console.error("Error in GET /api/user/onboarding-skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get("sb-access-token");

    if (!accessTokenCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from session - try API first, fallback to direct validation
    let user;
    try {
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/user`,
        {
          headers: {
            cookie: `sb-access-token=${accessTokenCookie.value}`,
          },
        },
      );

      if (!userResponse.ok) {
        console.log(
          "⚠️ Failed to validate user via API, trying direct Supabase validation",
        );
        // Fallback to direct Supabase validation
        const {
          data: { user: supabaseUser },
          error,
        } = await supabase.auth.getUser(accessTokenCookie.value);

        if (error || !supabaseUser) {
          return NextResponse.json(
            { error: "Invalid session" },
            { status: 401 },
          );
        }

        user = {
          id: supabaseUser.id,
          email: supabaseUser.email,
        };
      } else {
        const result = await userResponse.json();
        user = result.user;
      }
    } catch (error) {
      console.error("Error validating user session for skills save:", error);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { skills: skillsToSave } = await request.json();

    if (!Array.isArray(skillsToSave)) {
      return NextResponse.json(
        { error: "Skills must be an array" },
        { status: 400 },
      );
    }

    console.log(
      "💾 Saving skills for user:",
      user.id,
      "Skills count:",
      skillsToSave.length,
    );
    console.log("🔍 Full user object keys:", Object.keys(user));
    console.log("🔍 User student profile:", user.studentProfile);

    // Get user's age group to validate skills - try multiple possible locations
    let ageGroup = user.ageGroup || user.studentProfile?.age_group;

    // If no age group found, try to fetch from database
    if (!ageGroup && user.id) {
      try {
        const { data: studentProfile, error: studentProfileError } = await supabase
          .from('student_profiles')
          .select('age_group')
          .eq('id', user.id)
          .single();

        if (!studentProfileError && studentProfile) {
          ageGroup = studentProfile.age_group;
          console.log("🔍 Fetched age group from database:", ageGroup);
        }
      } catch (error) {
        console.log("⚠️ Could not fetch age group from database:", error);
      }
    }

    // If still no age group, use a fallback based on typical onboarding scenario
    if (!ageGroup) {
      console.log("⚠️ No age_group found, using fallback: young_adult");
      ageGroup = "young_adult"; // Default fallback for onboarding
    }

    console.log("🔍 User age group from ageGroup field:", user.ageGroup);
    console.log(
      "🔍 User age group from studentProfile:",
      user.studentProfile?.age_group,
    );
    console.log("🔍 Final age group used:", ageGroup);

    console.log("🔍 Using age group:", ageGroup);

    // Get available skills for user's current age group
    const { data: availableSkillsData, error: availableSkillsError } = await supabase
      .from('skills')
      .select(`
        id,
        name,
        skill_categories!inner (
          age_group
        )
      `)
      .eq('skill_categories.age_group', ageGroup);

    if (availableSkillsError) {
      console.error("Error fetching available skills:", availableSkillsError);
      return NextResponse.json(
        { error: "Failed to fetch available skills" },
        { status: 500 },
      );
    }

    const availableSkillIds = (availableSkillsData || []).map((skill) => skill.id);
    const availableSkillNamesMap = new Map(
      (availableSkillsData || []).map((skill) => [skill.name, skill.id]),
    );

    // Get or create custom skill category for this age group
    let customSkillCategory;
    const { data: existingCustomCategory, error: customCategoryError } = await supabase
      .from('skill_categories')
      .select('*')
      .eq('name', 'Custom')
      .eq('age_group', ageGroup)
      .single();

    if (customCategoryError || !existingCustomCategory) {
      // Create custom category
      const { data: newCustomCategory, error: createError } = await supabase
        .from('skill_categories')
        .insert({
          name: 'Custom',
          age_group: ageGroup,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating custom skill category:", createError);
        return NextResponse.json(
          { error: "Failed to create custom skill category" },
          { status: 500 },
        );
      }

      customSkillCategory = newCustomCategory;
      console.log("✅ Created custom skill category for age group:", ageGroup);
    } else {
      customSkillCategory = existingCustomCategory;
    }

    // Process custom skills (those without IDs) and create them in database
    for (const skill of skillsToSave) {
      if (!skill.id && !availableSkillNamesMap.has(skill.name)) {
        console.log("🔍 Processing custom skill:", skill.name);

        // Check if this custom skill already exists
        const { data: existingCustomSkill, error: existingSkillError } = await supabase
          .from('skills')
          .select('*')
          .eq('name', skill.name)
          .eq('category_id', customSkillCategory.id)
          .single();

        if (existingSkillError || !existingCustomSkill) {
          // Create the custom skill
          const { data: newCustomSkill, error: createSkillError } = await supabase
            .from('skills')
            .insert({
              name: skill.name,
              category_id: customSkillCategory.id,
            })
            .select()
            .single();

          if (createSkillError) {
            console.error("Error creating custom skill:", createSkillError);
            continue; // Skip this skill if creation fails
          }

          // Add to our maps so it can be processed normally
          availableSkillIds.push(newCustomSkill.id);
          availableSkillNamesMap.set(skill.name, newCustomSkill.id);
          console.log(
            "✅ Created custom skill:",
            skill.name,
            "with ID:",
            newCustomSkill.id,
          );
        } else {
          // Add existing custom skill to our maps
          availableSkillIds.push(existingCustomSkill.id);
          availableSkillNamesMap.set(skill.name, existingCustomSkill.id);
          console.log(
            "✅ Found existing custom skill:",
            skill.name,
            "with ID:",
            existingCustomSkill.id,
          );
        }
      }
    }

    // Now all skills (including newly created custom ones) should be valid
    const validSkills = skillsToSave.filter((skill) => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id);
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name);
      const isCustomSkill =
        !skill.id && skill.name && skill.name.trim().length > 0;

      return hasValidId || hasValidName || isCustomSkill;
    });
    console.log(
      "🔍 Processing skills for age group",
      ageGroup,
      ". Valid:",
      validSkills.length,
      "out of",
      skillsToSave.length,
    );

    // Log details about skill validation
    skillsToSave.forEach((skill) => {
      const hasValidId = skill.id && availableSkillIds.includes(skill.id);
      const hasValidName = skill.name && availableSkillNamesMap.has(skill.name);
      const isCustomSkill =
        !skill.id && skill.name && skill.name.trim().length > 0;
      console.log(
        `🔍 Skill "${skill.name}": hasValidId=${hasValidId}, hasValidName=${hasValidName}, isCustomSkill=${isCustomSkill}`,
      );
    });

    // Get currently saved user skills
    const { data: currentUserSkillsData, error: currentSkillsError } = await supabase
      .from('user_skills')
      .select(`
        id,
        skill_id,
        proficiency_level,
        skills (
          name
        )
      `)
      .eq('user_id', user.id);

    if (currentSkillsError) {
      console.error("Error fetching current user skills:", currentSkillsError);
      return NextResponse.json(
        { error: "Failed to fetch current user skills" },
        { status: 500 },
      );
    }

    const currentSkillsMap = new Map(
      (currentUserSkillsData || []).map((us) => [
        us.skills.name,
        { id: us.skill_id, level: us.proficiency_level },
      ]),
    );

    console.log(
      "🔍 Current saved skills:",
      currentUserSkillsData?.length || 0,
      Array.from(currentSkillsMap.keys()),
    );
    console.log(
      "🔍 New skills to save:",
      validSkills.length,
      validSkills.map((s) => s.name),
    );

    // Find skills to add (in new list but not in current)
    const skillsToAdd = validSkills.filter(
      (skill) => !currentSkillsMap.has(skill.name),
    );

    // Find skills to update (in both lists but with different proficiency level)
    const skillsToUpdate = validSkills.filter((skill) => {
      const current = currentSkillsMap.get(skill.name);
      return current && current.level !== (skill.level || 1);
    });

    // Don't remove any existing skills - only add new ones and update existing ones
    // This preserves skills that were added through other parts of the app
    console.log(
      "➕ Skills to add:",
      skillsToAdd.length,
      skillsToAdd.map((s) => s.name),
    );
    console.log(
      "🔄 Skills to update:",
      skillsToUpdate.length,
      skillsToUpdate.map((s) => s.name),
    );
    console.log("✅ Preserving existing skills that are not being modified");

    // Add new skills
    if (skillsToAdd.length > 0) {
      const userSkillData = skillsToAdd
        .map((skill) => {
          const skillId = skill.id || availableSkillNamesMap.get(skill.name);
          return skillId
            ? {
                user_id: user.id,
                skill_id: skillId,
                proficiency_level: skill.level || 1,
              }
            : null;
        })
        .filter(Boolean);

      if (userSkillData.length > 0) {
        const { error: insertError } = await supabase
          .from('user_skills')
          .insert(userSkillData);

        if (insertError) {
          console.error("Error inserting new skills:", insertError);
          return NextResponse.json(
            { error: "Failed to add new skills" },
            { status: 500 },
          );
        }

        console.log("✅ Added", userSkillData.length, "new skills");
      }
    }

    // Update existing skills with changed proficiency levels
    if (skillsToUpdate.length > 0) {
      for (const skill of skillsToUpdate) {
        const skillId = skill.id || availableSkillNamesMap.get(skill.name);
        if (skillId) {
          const { error: updateError } = await supabase
            .from('user_skills')
            .update({ proficiency_level: skill.level || 1 })
            .eq('user_id', user.id)
            .eq('skill_id', skillId);

          if (updateError) {
            console.error("Error updating skill:", updateError);
            // Continue with other skills even if one fails
          }
        }
      }
      console.log(
        "🔄 Updated",
        skillsToUpdate.length,
        "skill proficiency levels",
      );
    }

    console.log(
      "✅ All skills processed successfully, including custom skills",
    );

    // Log filtered out skills (those not valid for current age group)
    const filteredOutSkills = skillsToSave.filter(
      (skill) => !validSkills.includes(skill),
    );
    if (filteredOutSkills.length > 0) {
      console.log(
        "❌ Skills filtered out (not valid for age group",
        ageGroup,
        "):",
        filteredOutSkills.map((s) => s.name),
      );
    }

    const unchangedCount = validSkills.filter((skill) => {
      const current = currentSkillsMap.get(skill.name);
      return current && current.level === (skill.level || 1);
    }).length;
    console.log("🔄 Unchanged skills:", unchangedCount);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/user/onboarding-skills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
