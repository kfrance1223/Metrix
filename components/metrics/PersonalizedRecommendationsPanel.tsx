/**
 * components/metrics/PersonalizedRecommendationsPanel.tsx
 *
 * Displays personalized target recommendations based on user profile.
 * Visually distinct from the existing progression-based RecommendationsPanel.
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  acceptRecommendation,
  dismissRecommendation,
  acceptAllRecommendations,
} from "@/lib/actions";
import type { TargetRecommendationWithContext } from "@/types";

interface PersonalizedRecommendationsPanelProps {
  recommendations: TargetRecommendationWithContext[];
  hasProfile: boolean;
}

export default function PersonalizedRecommendationsPanel({
  recommendations: initialRecs,
  hasProfile,
}: PersonalizedRecommendationsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(true);
  const [recs, setRecs] = useState(initialRecs);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Prompt to create profile if none exists
  if (!hasProfile) {
    return (
      <div className="mt-8 card-gradient rounded-xl p-5 border border-accent/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-accent">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground/90">
              Get personalized targets
            </h3>
            <p className="text-xs text-muted-foreground">
              Complete your profile for evidence-based target recommendations.
            </p>
          </div>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 mt-2 px-4 py-1.5 rounded-lg text-xs font-medium
            bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          Set up profile
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    );
  }

  if (recs.length === 0) return null;

  const handleAccept = (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      try {
        await acceptRecommendation(id);
        setRecs((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      } catch (err) {
        console.error("Failed to accept recommendation:", err);
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  const handleDismiss = (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    startTransition(async () => {
      try {
        await dismissRecommendation(id);
        setRecs((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      } catch (err) {
        console.error("Failed to dismiss recommendation:", err);
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  const handleAcceptAll = () => {
    startTransition(async () => {
      try {
        await acceptAllRecommendations();
        setRecs([]);
        router.refresh();
      } catch (err) {
        console.error("Failed to accept all recommendations:", err);
      }
    });
  };

  const confidenceColor = (c: string) => {
    switch (c) {
      case "high": return "text-emerald-400";
      case "medium": return "text-amber-400";
      case "low": return "text-orange-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          >
            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
            Personalized Recommendations
          </h2>
          <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            Based on your profile
          </span>
          <span className="text-xs text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">
            {recs.length}
          </span>
        </button>

        {expanded && recs.length > 1 && (
          <button
            onClick={handleAcceptAll}
            disabled={isPending}
            className="text-xs font-medium text-accent hover:text-accent-light transition-colors cursor-pointer disabled:opacity-50"
          >
            Accept All
          </button>
        )}
      </div>

      {expanded && (
        <>
          <p className="text-[11px] text-muted-foreground/60 mb-3">
            Your score may temporarily change as targets adjust. Accepting updates the submetric&apos;s target value.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map((rec) => {
              const isProcessing = processingIds.has(rec.id);
              return (
                <div
                  key={rec.id}
                  className={`card-gradient rounded-xl p-4 relative overflow-hidden border border-accent/10 ${isProcessing ? "opacity-60" : ""}`}
                >
                  {/* Color accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: rec.metric_color }}
                  />

                  <div className="pl-3">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-accent shrink-0">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M7 4.5v3M5 7.5l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-sm font-semibold text-foreground/90">
                          {rec.submetric_name}
                        </span>
                      </div>
                      <span className={`text-[10px] font-medium ${confidenceColor(rec.confidence)}`}>
                        {rec.confidence}
                      </span>
                    </div>

                    {/* Target change */}
                    {rec.current_target != null && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">
                          {rec.current_target}
                        </span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-accent">
                          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs font-semibold text-accent">
                          {rec.recommended_target}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-foreground/65 mb-3 leading-relaxed">
                      {rec.reasoning}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAccept(rec.id)}
                        disabled={isProcessing}
                        className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer
                          bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDismiss(rec.id)}
                        disabled={isProcessing}
                        className="px-3 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground/70 hover:bg-foreground/5
                          cursor-pointer transition-colors disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>

                    <p className="text-[11px] text-muted-foreground/60 mt-2">
                      {rec.metric_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
