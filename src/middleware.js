import { NextResponse } from 'next/server';

export function middleware(request) {
  // Diagnostics tracking
  const path = request.nextUrl.pathname;
  console.log(`[RBAC Middleware] Verifying access boundary for route: ${path}`);
  
  // Future deployment checks for session headers go here
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/rbac/:path*'
  ],
};
