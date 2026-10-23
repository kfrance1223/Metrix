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
import type { Database } from "@/types/database";


export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
