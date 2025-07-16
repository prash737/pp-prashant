
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    
    // Get the current session token to sign out from Supabase
    const sessionToken = cookieStore.get('parent_session')?.value
    
    // Sign out from Supabase if we have a session
    if (sessionToken) {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Error signing out from Supabase:', error)
        // Continue with logout even if Supabase signout fails
      }
    }

    // Get the host from the request
    const host = request.headers.get('host') || '';
    const isProduction = process.env.NODE_ENV === 'production' || host.includes('.repl.co');

    // Clear all possible parent authentication cookies
    const cookiesToClear = [
      'parent_session',
      'parent_id',
      'parent-auth-token',
      'parent_access_token',
      'parent_refresh_token'
    ];

    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully',
      clearStorage: true // Signal to client to clear all storage
    })

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
    response.headers.delete('x-parent-id');
    response.headers.delete('x-parent-email');

    return response;

  } catch (error) {
    console.error('Parent logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}
