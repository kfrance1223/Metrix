/**
 * lib/supabase/server.ts
 *
 * Server-side Supabase client.
 *
 * Use this in:
 *   - Server Components  (data fetching in async pages / layouts)
 *   - Server Actions     (form submissions, mutations)
 *   - Route Handlers     (API routes)
 *
 * It reads cookies from the incoming request so the current user's
 * auth session is available on the server.  Never expose this client
 * to the browser.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        },
      },
    }
  );
}
