
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check cookies
    const cookies = request.cookies;
    const allCookies = cookies.getAll();
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    
    // List all headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    // Try to find Supabase cookies
    const supabaseCookies = allCookies.filter(c => 
      c.name.startsWith('sb-') || c.name.includes('supabase')
    );
    
    // Try to extract token from header
    let tokenFromHeader = null;
    if (authHeader) {
      tokenFromHeader = authHeader.replace('Bearer ', '');
    }
    
    // Try to verify token if available
    let userData = null;
    let tokenVerificationError = null;
    
    if (tokenFromHeader) {
      try {
        const { data, error } = await supabase.auth.getUser(tokenFromHeader);
        if (!error && data) {
          userData = data;
        } else {
          tokenVerificationError = error?.message || "Unknown error";
        }
      } catch (e) {
        tokenVerificationError = e instanceof Error ? e.message : String(e);
      }
    }
    
    // Return all debug information
    return NextResponse.json({
      success: true,
      debug: {
        cookies: {
          count: allCookies.length,
          supabaseCookies: supabaseCookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' })),
          allCookies: allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 10) + '...' }))
        },
        headers: headers,
        authHeader: authHeader ? `${authHeader.substring(0, 15)}...` : null,
        tokenFound: !!tokenFromHeader,
        tokenVerified: !!userData,
        tokenVerificationError,
        userData: userData ? {
          id: userData.user?.id,
          email: userData.user?.email,
          metadata: userData.user?.user_metadata
        } : null
      }
    });
  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
