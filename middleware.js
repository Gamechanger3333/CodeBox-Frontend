import { NextResponse } from 'next/server';

// NOTE: Frontend (vercel.app) and backend (onrender.com) are on different
// domains. The httpOnly auth cookie is set by the backend in response to a
// cross-origin request, so it is only ever stored against the backend's own
// origin — this middleware (which runs on the frontend's domain) can never
// see it via request.cookies. A cookie-based check here would either never
// fire (auth-route case) or permanently force-redirect logged-in users away
// from '/' (protected-route case), which is exactly the "login succeeds but
// dashboard never loads" bug this used to cause.
//
// Auth is therefore handled entirely client-side via /check_authentication:
// see the useEffect in app/login/page.js (redirects away from /login if
// already authenticated) and the query in components/main/MainBody.js
// (redirects to /login if not authenticated).

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};