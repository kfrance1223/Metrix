/**
 * app/(dashboard)/settings/page.tsx
 *
 * Settings page — theme toggle and account actions.
 */
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isDark = theme === "dark";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-8">Settings</h1>

      {/* Appearance */}
      <div className="card-gradient rounded-2xl p-6 mb-4">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mounted && (
              isDark ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-muted-foreground">
                  <path d="M15.5 9.5a6.5 6.5 0 01-7-7A6.5 6.5 0 109.5 16a6.5 6.5 0 006-6.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-muted-foreground">
                  <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 1.5v1M9 15.5v1M1.5 9h1M15.5 9h1M3.7 3.7l.7.7M13.6 13.6l.7.7M3.7 14.3l.7-.7M13.6 4.4l.7-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )
            )}
            <div>
              <p className="text-sm text-foreground">Theme</p>
              <p className="text-xs text-muted-foreground">
                {mounted ? (isDark ? "Dark mode" : "Light mode") : "Loading..."}
              </p>
            </div>
          </div>

          {mounted && (
            <button type="button" role="switch" aria-checked={isDark}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200
                ${isDark ? "bg-accent" : "bg-foreground/20"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${isDark ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="card-gradient rounded-2xl p-6">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Account
        </h2>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground
            hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-all duration-200">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3.333A1.333 1.333 0 012 12.667V3.333A1.333 1.333 0 013.333 2H6M10.667 11.333L14 8l-3.333-3.333M14 8H6"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
}
