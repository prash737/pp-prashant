import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for static files and API routes that don't need auth
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/status') ||
    path.startsWith('/api/health') ||
    path.includes('.') ||
    path.startsWith('/images')
  ) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/safety',
    '/blog',
    '/careers',
    '/mentorship',
    '/verify-parent',
    '/parent/login',
    '/parent/signup',
    '/share-profile',
    '/public-view'
  ];

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for auth token in cookies
  const authToken = request.cookies.get('sb-access-token')?.value;

  if (!authToken) {
    console.log('Middleware: No auth token found, redirecting to login');
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }

  // Token exists, let the request continue
  // The actual token validation will happen on the server side in API routes
  const response = NextResponse.next();
  response.headers.set('x-middleware-cache', 'no-cache');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};