
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { prompt_token, response_token, model_name, user_id } = await request.json();

    const supabase = createClient();

    // Insert token usage record
    const { data, error } = await supabase
      .from('token_usage')
      .insert({
        prompt_token,
        response_token,
        model_name,
        user_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving token usage:', error);
      return NextResponse.json({ error: 'Failed to save token usage' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Token usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createClient();

    // Get total token usage for user
    const { data, error } = await supabase
      .from('token_usage')
      .select('prompt_token, response_token')
      .eq('user_id', user_id);

    if (error) {
      console.error('Error fetching token usage:', error);
      return NextResponse.json({ error: 'Failed to fetch token usage' }, { status: 500 });
    }

    const totalPromptTokens = data.reduce((sum, record) => sum + (record.prompt_token || 0), 0);
    const totalResponseTokens = data.reduce((sum, record) => sum + (record.response_token || 0), 0);

    return NextResponse.json({
      totalPromptTokens,
      totalResponseTokens,
      totalTokens: totalPromptTokens + totalResponseTokens
    });
  } catch (error) {
    console.error('Token usage fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
