import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware function replaces the withAuth middleware
// to allow both NextAuth and custom auth to work
export function middleware(request: NextRequest) {
  // Allow access to all routes for now to debug the redirect issue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/profile/:path*',
  ],
};
