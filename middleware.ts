
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Skip middleware entirely for static assets and API routes
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
    path === '/' ||
    path.startsWith('/public-view/') ||
    path.startsWith('/share-profile/')
  ) {
    return NextResponse.next();
  }
  
  // Ultra-fast path for student profiles - minimal auth check
  if (path.startsWith('/student/profile/')) {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    
    if (!accessToken) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Skip Supabase validation entirely - just pass the token through
    // Let the page components handle detailed auth if needed
    const response = NextResponse.next();
    response.headers.set('x-middleware-auth', 'minimal');
    return response;
  }
  
  // Relaxed auth for other student pages
  if (path.startsWith('/student/')) {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    
    if (!accessToken) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Skip validation, just check token exists
    return NextResponse.next();
  }
  
  // Standard auth for critical paths only
  const criticalPaths = [
    '/onboarding',
    '/feed',
    '/messages',
    '/mentor/profile',
    '/institution/profile'
  ];
  
  const isCritical = criticalPaths.some(cp => 
    path === cp || path.startsWith(`${cp}/`)
  );
  
  if (!isCritical) {
    // Non-critical paths get minimal auth
    const accessToken = request.cookies.get('sb-access-token')?.value;
    return accessToken ? NextResponse.next() : NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Full auth only for critical paths
  const accessToken = request.cookies.get('sb-access-token')?.value;
  
  if (!accessToken) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Quick validation for critical paths
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', path);
      return NextResponse.redirect(redirectUrl);
    }
    
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-email', user.email || '');
    return response;
    
  } catch (error) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    // Only run middleware on specific paths to reduce overhead
    '/student/:path*',
    '/mentor/:path*',
    '/institution/:path*',
    '/onboarding/:path*',
    '/feed/:path*',
    '/messages/:path*',
    '/explore/:path*',
    '/notifications/:path*'
  ],
};
