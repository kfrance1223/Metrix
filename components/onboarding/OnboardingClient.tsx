/**
 * components/onboarding/OnboardingClient.tsx
 *
 * Single-step onboarding: select/deselect template categories, then create them.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_TEMPLATES } from "@/lib/onboarding-templates";
import { createMetricsFromTemplates } from "@/lib/actions";

export default function OnboardingClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<number>>(
    new Set(ONBOARDING_TEMPLATES.map((_, i) => i))
  );
  const [error, setError] = useState<string | null>(null);

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSubmit = () => {
    setError(null);
    const templates = ONBOARDING_TEMPLATES.filter((_, i) => selected.has(i));
    if (templates.length === 0) {
      setError("Please select at least one category, or skip to create your own later.");
      return;
    }
    startTransition(async () => {
      try {
        await createMetricsFromTemplates(templates);
        router.push("/");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      try {
        await createMetricsFromTemplates([]);
        router.push("/");
        router.refresh();
      } catch { router.push("/"); }
    });
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          <span className="text-accent">Welcome to </span>
          <span className="text-accent">Metri</span>
          <span className="text-accent-light">X</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Choose categories to start tracking. You can customize everything later.
        </p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {ONBOARDING_TEMPLATES.map((template, index) => {
          const isSelected = selected.has(index);
          return (
            <button key={template.name} type="button" onClick={() => toggle(index)}
              className={`text-left p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${isSelected
                  ? "border-accent/50 bg-accent/5"
                  : "border-card-border/50 bg-card/50 hover:border-card-border"
                }`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground text-sm">
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: template.color }} />
                  {template.name}
                </h3>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                  ${isSelected ? "border-accent bg-accent" : "border-muted/40"}`}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {template.submetrics.map((s) => s.name).join(" \u00B7 ")}
              </p>
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={handleSkip} disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5
            cursor-pointer transition-all duration-200 disabled:opacity-50">
          Skip for now
        </button>
        <button type="button" onClick={handleSubmit} disabled={isPending}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold cursor-pointer
            bg-linear-to-r from-accent to-accent-light hover:brightness-110
            text-black transition-all duration-200 shadow-lg shadow-accent/20 disabled:opacity-50">
          {isPending ? "Setting up..." : "Get Started"}
        </button>
      </div>
    </div>
  );
}
