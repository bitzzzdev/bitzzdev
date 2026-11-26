import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { maintenanceMiddleware } from '@/lib/maintenance';

export function middleware(request: NextRequest) {
  const maintenanceResponse = maintenanceMiddleware(request);
  if (maintenanceResponse) {
    return maintenanceResponse;
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