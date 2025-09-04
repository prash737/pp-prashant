
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    console.log("🔄 Fetching institution categories and types");

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch institution categories with their types using direct Supabase query
    const { data: categories, error } = await supabase
      .from('institution_categories')
      .select(`
        id,
        name,
        slug,
        description,
        institution_types (
          id,
          name,
          slug
        )
      `)
      .order('id', { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch institution types",
          details: error.message,
        },
        { status: 500 },
      );
    }

    // Transform the data to match the expected format (order types by id)
    const transformedCategories = (categories || []).map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      types: (category.institution_types || [])
        .sort((a, b) => a.id - b.id)
        .map((type) => ({
          id: type.id,
          name: type.name,
          slug: type.slug,
        }))
    }));

    console.log(`✅ Fetched ${transformedCategories.length} categories with types`);

    return NextResponse.json({
      success: true,
      data: transformedCategories,
    });
  } catch (error) {
    console.error("❌ Error fetching institution types:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch institution types",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
