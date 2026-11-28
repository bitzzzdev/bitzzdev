import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { maintenanceMiddleware } from '@/lib/maintenance';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Paths that require authentication (exact match or prefix, but not auth paths)
const PROTECTED_PATHS = ['/dashboard'];
// Paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = ['/dashboard/login'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check maintenance mode first
  const maintenanceResponse = maintenanceMiddleware(request);
  if (maintenanceResponse) {
    return maintenanceResponse;
  }

  // Check authentication for protected paths
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path)) && !AUTH_PATHS.some(authPath => pathname.startsWith(authPath));
  const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path));

  const session = await getSession(request);

  // If accessing protected path without session, redirect to login
  if (isProtectedPath && !session) {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth path with valid session, redirect to dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|public/).*)',
  ],
};
