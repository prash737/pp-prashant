
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();
    
    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider is required' },
        { status: 400 }
      );
    }
    
    // Create OAuth URL for the specified provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider.toLowerCase() as any,
      options: {
        redirectTo: 'https://pathpiper.replit.app/api/auth/callback',
      },
    });
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      url: data.url,
    });
    
  } catch (error) {
    console.error('Social login API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
