/**
 * app/auth/callback/route.ts
 *
 * Server-side Route Handler for Supabase auth callbacks.
 *
 * Supabase PKCE flow (used by magic links and OAuth) redirects
 * the browser here with a `?code=` query parameter. This handler
 * exchanges that code for a session on the server, sets the auth
 * cookies, and redirects to the dashboard.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    // No code — redirect to login
    return NextResponse.redirect(new URL("/login", origin));
  }

  const response = NextResponse.redirect(new URL("/", origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return response;
}
