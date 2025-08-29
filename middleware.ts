
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define paths that should be protected
  const protectedPaths = [
    '/onboarding',
    '/feed',
    '/explore',
    '/immersive-feed',
    '/profile',
    '/student',
    '/mentor',
    '/institution',
  ];

  // Define public paths
  const publicPaths = ['/login', '/register', '/signup', '/forgot-password', '/api'];

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );

  // If it's a protected path, validate authentication properly
  if (isProtectedPath && !isPublicPath) {
    // Try multiple cookie names that Supabase might use
    const accessToken = request.cookies.get('sb-access-token')?.value || 
                       request.cookies.get('supabase-auth-token')?.value ||
                       request.cookies.get('sb-auth-token')?.value;

    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!accessToken && !refreshToken) {
      // No tokens at all, redirect to login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }

    // Verify token with Supabase
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      let user = null;
      let authError = null;

      // First try with access token
      if (accessToken) {
        const { data: { user: authUser }, error } = await supabase.auth.getUser(accessToken);
        user = authUser;
        authError = error;
      }

      // If access token failed and we have refresh token, try to refresh
      if ((!user || authError) && refreshToken) {
        console.log('Middleware: Attempting token refresh');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken
        });

        if (refreshData?.session?.user) {
          user = refreshData.session.user;
          authError = null;

          // Set new access token in response
          const response = NextResponse.next();
          response.cookies.set('sb-access-token', refreshData.session.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
          });
          response.headers.set('x-user-id', user.id);
          response.headers.set('x-user-email', user.email || '');
          return response;
        }
      }

      if (authError || !user) {
        console.log('Middleware: Invalid token, redirecting to login');
        // Invalid token, redirect to login
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('from', path);
        return NextResponse.redirect(redirectUrl);
      }

      // Token is valid, inject user info into headers for the app to use
      const response = NextResponse.next();
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-email', user.email || '');
      return response;

    } catch (error) {
      console.error('Middleware auth error:', error);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
