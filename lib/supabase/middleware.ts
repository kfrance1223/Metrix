/**
 * lib/supabase/middleware.ts
 *
 * Supabase session-refresh helper — imported by the root middleware.ts.
 *
 * WHY this exists:
 *   Supabase access tokens expire every hour.  The session refresh
 *   must happen on every request so that Server Components always
 *   have a valid token when they query the database.  This helper
 *   wires up cookie read/write so the refresh-token round-trip
 *   works transparently across server and client.
 *
 * Call this at the top of the root middleware — it returns the
 * Supabase client and the current user (or null).
 */

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

export async function updateSupabaseSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write updated cookies to BOTH the request and the response.
          // Request  — so any later middleware in the chain sees the fresh token.
          // Response — so the browser receives the refreshed cookie.
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // getUser() is used deliberately instead of getSession().
  // getSession() trusts the local JWT without server-side verification;
  // getUser() hits Supabase Auth to confirm the user still exists.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}
