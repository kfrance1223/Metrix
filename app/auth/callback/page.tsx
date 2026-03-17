/**
 * app/auth/callback/page.tsx
 *
 * Supabase OAuth / Magic Link callback handler.
 *
 * After the user clicks the magic link (or authorizes an OAuth app)
 * Supabase redirects the browser here with a `code` query parameter.
 * This page exchanges that code for a session, then sends the user
 * to the dashboard.
 *
 * "use client" — needs window.location (for the code param) and
 * useRouter (for the post-exchange redirect).
 *
 * Flow:
 *   1. Read `code` from URL search params
 *   2. Call supabase.auth.exchangeCodeForSession(code)
 *   3. Success  →  redirect to /  (dashboard)
 *   4. Failure  →  redirect to /login
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const exchangeCode = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (!code) {
        // No code in the URL — something went wrong upstream
        router.push("/login");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        router.push("/login");
        return;
      }

      router.push("/");
    };

    exchangeCode();
  }, [router]);

  // Brief loading indicator while the exchange runs
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing you in…</p>
    </div>
  );
}
