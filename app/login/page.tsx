/**
 * app/login/page.tsx
 *
 * Authentication page — themed with MetriX branding.
 * Tabbed UI: Magic Link (passwordless) or Email & Password sign-in via Supabase.
 */
"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "magic-link" | "password";
type PasswordTab = "sign-in" | "sign-up";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("magic-link");
  const [passwordTab, setPasswordTab] = useState<PasswordTab>("sign-in");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    if (passwordTab === "sign-up") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      window.location.href = "/";
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-sm text-center score-gradient rounded-2xl p-8">
          <p className="text-foreground text-lg mb-2">Check your email</p>
          <p className="text-muted-foreground text-sm">
            We sent {mode === "magic-link" ? "a magic link" : "a confirmation link"} to{" "}
            <strong className="text-accent">{email}</strong>.{" "}
            {mode === "magic-link" ? "Click it to log in." : "Click it to verify your account."}
          </p>
          <button
            onClick={() => { setSent(false); setError(null); }}
            className="mt-4 text-accent hover:text-accent-light text-sm cursor-pointer transition-colors duration-200"
          >
            Try a different email
          </button>
        </div>
      </div>
    );
  }

  const inputClasses =
    "bg-input border border-input-border rounded-xl px-3 py-2.5 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm score-gradient rounded-2xl p-8">
        {/* Branding */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            <span className="text-accent">Metri</span>
            <span className="text-accent-light">X</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to track your life metrics
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl bg-input p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode("magic-link"); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200
              ${mode === "magic-link"
                ? "bg-accent/15 text-accent shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Magic Link
          </button>
          <button
            type="button"
            onClick={() => { setMode("password"); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all duration-200
              ${mode === "password"
                ? "bg-accent/15 text-accent shadow-sm"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Email &amp; Password
          </button>
        </div>

        {mode === "magic-link" ? (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={inputClasses}
              />
            </label>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-linear-to-r from-accent to-accent-light hover:brightness-110
                text-black rounded-xl py-2.5 text-sm font-semibold cursor-pointer
                transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        ) : (
          <>
            {/* Sign In / Sign Up sub-tabs */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => { setPasswordTab("sign-in"); setError(null); }}
                className={`text-sm font-medium pb-1 cursor-pointer transition-all duration-200 border-b-2
                  ${passwordTab === "sign-in"
                    ? "text-accent border-accent"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setPasswordTab("sign-up"); setError(null); }}
                className={`text-sm font-medium pb-1 cursor-pointer transition-all duration-200 border-b-2
                  ${passwordTab === "sign-up"
                    ? "text-accent border-accent"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handlePassword} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={inputClasses}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={passwordTab === "sign-up" ? "Min 6 characters" : "Your password"}
                  required
                  minLength={6}
                  className={inputClasses}
                />
              </label>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-linear-to-r from-accent to-accent-light hover:brightness-110
                  text-black rounded-xl py-2.5 text-sm font-semibold cursor-pointer
                  transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                {loading
                  ? "Loading..."
                  : passwordTab === "sign-up"
                  ? "Create Account"
                  : "Sign In"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
