
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip auth for static files, API routes (let them handle their own auth), and public paths
  if (
    path.startsWith('/_next/') ||
    path.startsWith('/api/') ||
    path.startsWith('/images/') ||
    path.startsWith('/uploads/') ||
    path.includes('.') || // Static files with extensions
    path === '/login' ||
    path === '/register' ||
    path === '/signup' ||
    path === '/forgot-password' ||
    path === '/'
  ) {
    return NextResponse.next();
  }
  
  // Define paths that require authentication
  const protectedPaths = [
    '/onboarding',
    '/feed',
    '/explore',
    '/immersive-feed',
    '/profile',
    '/student',
    '/mentor',
    '/institution',
    '/messages',
    '/notifications'
  ];
  
  // Check if current path needs authentication
  const requiresAuth = protectedPaths.some(pp => 
    path === pp || path.startsWith(`${pp}/`)
  );
  
  if (!requiresAuth) {
    return NextResponse.next();
  }
  
  // Fast token check - only get access token first
  const accessToken = request.cookies.get('sb-access-token')?.value;
  
  if (!accessToken) {
    // No access token, redirect immediately
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Quick token validation without full user fetch
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      // Token invalid, redirect to login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Valid token - pass user info to app
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
