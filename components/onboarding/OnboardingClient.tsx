/**
 * components/onboarding/OnboardingClient.tsx
 *
 * Two-step onboarding:
 *   Step 1: Select/deselect template categories
 *   Step 2: Optional profile setup for personalized targets
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_TEMPLATES } from "@/lib/onboarding-templates";
import { createMetricsFromTemplates } from "@/lib/actions";
import ProfileFormClient from "@/components/profile/ProfileFormClient";
import {
  FITNESS_CATEGORY_ALIASES,
  FINANCE_CATEGORY_ALIASES,
} from "@/lib/recommendations/constants";

export default function OnboardingClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<number>>(
    new Set(ONBOARDING_TEMPLATES.map((_, i) => i))
  );
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"templates" | "profile">("templates");

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Determine which profile sections to show based on selected templates
  const selectedTemplates = ONBOARDING_TEMPLATES.filter((_, i) => selected.has(i));
  const selectedNames = selectedTemplates.map((t) => t.name.toLowerCase());
  const hasFitnessSelected = selectedNames.some((name) =>
    FITNESS_CATEGORY_ALIASES.some((alias) => name.includes(alias))
  );
  const hasFinanceSelected = selectedNames.some((name) =>
    FINANCE_CATEGORY_ALIASES.some((alias) => name.includes(alias))
  );

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
        // Move to profile step
        setStep("profile");
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

  const handleProfileComplete = () => {
    router.push("/");
    router.refresh();
  };

  // Step 2: Profile setup
  if (step === "profile") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs text-muted-foreground bg-foreground/5 px-2.5 py-0.5 rounded-full">
              Step 2 of 2 — Optional
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            <span className="text-accent">Tell us about yourself</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            This helps us set personalized targets instead of generic defaults.
            You can always update this later in your profile.
          </p>
        </div>

        <div className="w-full">
          <ProfileFormClient
            initialProfile={null}
            hasFitnessMetrics={hasFitnessSelected}
            hasFinanceMetrics={hasFinanceSelected}
            compact
            onComplete={handleProfileComplete}
          />
        </div>
      </div>
    );
  }

  // Step 1: Template selection
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground bg-foreground/5 px-2.5 py-0.5 rounded-full">
            Step 1 of 2
          </span>
        </div>
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
          {isPending ? "Setting up..." : "Next"}
        </button>
      </div>
    </div>
  );
}
