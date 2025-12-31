import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('teritage_token');

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    // Optional: Add the current path as a query parameter to redirect back after login
    // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/wallet',
    '/beneficiary',
    '/activity',
    '/settings/:path*',
    '/inheritance/:path*',
    '/connect-wallet/:path*'
  ],
};
