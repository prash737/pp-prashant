import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Clear the authentication cookies
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
      clearStorage: true // Signal to client to clear all storage
    })

    // Get the host from the request
    const host = request.headers.get('host') || '';
    const isProduction = process.env.NODE_ENV === 'production' || host.includes('.repl.co');

    // Clear all possible authentication cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-user-id',
      'supabase-auth-token',
      'supabase.auth.token',
      'auth-token'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 0,
        path: '/',
        domain: isProduction ? undefined : undefined
      });

      // Also clear without httpOnly for client-accessible cookies
      response.cookies.set(cookieName, '', {
        httpOnly: false,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 0,
        path: '/',
        domain: isProduction ? undefined : undefined
      });
    });

    // Clear any session-related headers
    response.headers.delete('x-user-id');
    response.headers.delete('x-user-email');

    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}