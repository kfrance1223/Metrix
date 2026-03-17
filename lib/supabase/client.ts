/**
 * lib/supabase/client.ts
 *
 * Browser-side Supabase client.
 *
 * Use this inside Client Components ("use client") for:
 *   - Auth actions  (sign in, sign out, subscribe to session changes)
 *   - Any Supabase call triggered by a user interaction
 *
 * Do NOT use this in Server Components or Server Actions —
 * use the server client (./server.ts) there instead.
 */

import { createBrowserClient } from "@supabase/ssr";

// ---------------------------------------------------------------------------
// We skip a full Database type map because generating accurate types requires
// `supabase gen types`. Instead we create an untyped client and rely on our
// own types/index.ts interfaces for application-level type safety.
// ---------------------------------------------------------------------------

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
