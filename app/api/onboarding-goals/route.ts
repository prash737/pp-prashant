
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch user's goals using direct Supabase query
    const { data: userGoals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (goalsError) {
      console.error("Supabase query error:", goalsError);
      return NextResponse.json(
        { error: "Failed to fetch goals" },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for consistency with frontend
    const transformedGoals = (userGoals || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      timeframe: goal.timeframe,
      completed: goal.completed,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at
    }));

    return NextResponse.json({ goals: transformedGoals });
  } catch (error) {
    console.error("Goals API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("sb-access-token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { goals: goalsList } = await request.json();

    if (!Array.isArray(goalsList)) {
      return NextResponse.json(
        { error: "Goals must be an array" },
        { status: 400 },
      );
    }

    // Get existing goals from database using direct Supabase query
    const { data: existingGoals, error: existingError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    if (existingError) {
      console.error("Error fetching existing goals:", existingError);
      return NextResponse.json(
        { error: "Failed to fetch existing goals" },
        { status: 500 }
      );
    }

    // Separate new goals (negative IDs) from existing goals (positive IDs)
    const newGoals = goalsList.filter(
      (goal) => typeof goal.id === "number" && goal.id < 0,
    );
    const existingGoalsFromClient = goalsList.filter(
      (goal) => typeof goal.id === "number" && goal.id > 0,
    );

    // Find goals to delete (exist in DB but not in client)
    const existingGoalIds = existingGoalsFromClient.map((goal) => goal.id);
    const goalsToDelete = (existingGoals || []).filter(
      (goal) => !existingGoalIds.includes(goal.id),
    );

    // Find goals to update (exist in both but might have changes)
    const goalsToUpdate = existingGoalsFromClient.filter((clientGoal) => {
      const dbGoal = (existingGoals || []).find((g) => g.id === clientGoal.id);
      if (!dbGoal) return false;

      // Check if any field has changed
      return (
        dbGoal.title !== clientGoal.title ||
        dbGoal.description !== (clientGoal.description || null) ||
        dbGoal.category !== (clientGoal.category || null) ||
        dbGoal.timeframe !== (clientGoal.timeframe || null)
      );
    });

    let operationsCount = 0;

    // Delete removed goals using direct Supabase query
    if (goalsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('user_id', user.id)
        .in('id', goalsToDelete.map((goal) => goal.id));

      if (deleteError) {
        console.error("Error deleting goals:", deleteError);
        return NextResponse.json(
          { error: "Failed to delete goals" },
          { status: 500 }
        );
      }

      operationsCount += goalsToDelete.length;
      console.log(`🗑️ Deleted ${goalsToDelete.length} goals`);
    }

    // Insert new goals using direct Supabase query
    if (newGoals.length > 0) {
      const goalsToInsert = newGoals.map((goal) => ({
        user_id: user.id,
        title: goal.title,
        description: goal.description || null,
        category: goal.category || null,
        timeframe: goal.timeframe || null,
        completed: false,
      }));

      const { data: insertResult, error: insertError } = await supabase
        .from('goals')
        .insert(goalsToInsert)
        .select('id');

      if (insertError) {
        console.error("Error inserting goals:", insertError);
        return NextResponse.json(
          { error: "Failed to insert goals" },
          { status: 500 }
        );
      }

      operationsCount += (insertResult || []).length;
      console.log(`➕ Added ${(insertResult || []).length} new goals`);
    }

    // Update existing goals that have changes using direct Supabase query
    for (const goalToUpdate of goalsToUpdate) {
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          title: goalToUpdate.title,
          description: goalToUpdate.description || null,
          category: goalToUpdate.category || null,
          timeframe: goalToUpdate.timeframe || null,
        })
        .eq('id', goalToUpdate.id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Error updating goal:", updateError);
        // Continue with other goals even if one fails
        continue;
      }

      operationsCount++;
    }

    if (goalsToUpdate.length > 0) {
      console.log(`✏️ Updated ${goalsToUpdate.length} goals`);
    }

    if (operationsCount === 0) {
      console.log(`✅ No changes detected - goals are already up to date`);
      return NextResponse.json({
        message: "No changes detected - goals are already up to date",
        operations: 0,
      });
    }

    console.log(
      `✅ Successfully processed ${operationsCount} goal operations for user ${user.id}`,
    );
    return NextResponse.json({
      message: "Goals updated successfully",
      operations: operationsCount,
      deleted: goalsToDelete.length,
      added: newGoals.length,
      updated: goalsToUpdate.length,
    });
  } catch (error) {
    console.error("Goals save API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
