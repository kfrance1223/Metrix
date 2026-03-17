/**
 * middleware.ts  —  project root  (NOT inside app/)
 *
 * Next.js edge middleware.  Runs before every request that matches
 * the config.matcher pattern below.
 *
 * Responsibilities:
 *   1. Refresh the Supabase auth session so Server Components
 *      always have a fresh token.
 *   2. Redirect unauthenticated users to /login.
 *   3. Redirect already-authenticated users away from /login.
 */

import { NextResponse, type NextRequest } from "next/server";
import { updateSupabaseSession } from "./lib/supabase/middleware";

// ---------------------------------------------------------------------------
// Set to `true` once .env.local is configured and Supabase is connected.
// While false every request passes through — no auth checks, no session refresh.
// ---------------------------------------------------------------------------
const AUTH_ENABLED = true;

export async function middleware(request: NextRequest) {
  if (!AUTH_ENABLED) return NextResponse.next();

  const response = NextResponse.next();

  // 1. Refresh session cookies (no-op if already fresh)
  const { user } = await updateSupabaseSession(request, response);

  const pathname = request.nextUrl.pathname;

  // Routes that are allowed without authentication
  const isAuthCallback = pathname.startsWith("/auth");
  const isLoginPage = pathname === "/login";

  // 2. Guard — bounce unauthenticated users to login
  if (!user && !isAuthCallback && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. If already logged in, skip the login page
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

/**
 * Matcher: run middleware on every route EXCEPT Next.js internals
 * and static assets (favicon, sitemap, robots).
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
