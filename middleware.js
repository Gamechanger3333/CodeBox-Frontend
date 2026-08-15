import { NextResponse } from 'next/server';

// Routes that require the user to be logged OUT (auth pages)
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

// Routes that require the user to be logged IN
const PROTECTED_ROUTES = ['/'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);

  // Cookie presence is just a fast first-pass check — it can be expired
  // or invalid. MainBody's /check_authentication call is the real source
  // of truth and still runs client-side as a second layer.
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/signup', '/forgot-password'],
};