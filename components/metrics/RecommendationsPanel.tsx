/**
 * components/metrics/RecommendationsPanel.tsx
 *
 * Collapsible section with target adjustment recommendations.
 */
"use client";

import { useState } from "react";
import type { ProgressionRecommendation } from "@/types";

interface RecommendationsPanelProps {
  recommendations: ProgressionRecommendation[];
}

export default function RecommendationsPanel({
  recommendations,
}: RecommendationsPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = recommendations.filter((r) => !dismissed.has(r.submetricId));
  if (visible.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-4 cursor-pointer group"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        >
          <path
            d="M4 2l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
          Recommendations
        </h2>
        <span className="text-xs text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">
          {visible.length}
        </span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((rec) => (
            <div
              key={rec.submetricId}
              className="card-gradient rounded-xl p-4 relative overflow-hidden"
            >
              {/* Color accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: rec.metricColor }}
              />

              <div className="pl-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    {rec.type === "raise_target" ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="text-emerald-400 shrink-0"
                      >
                        <path
                          d="M7 10V4M7 4l3 3M7 4L4 7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className="text-amber-400 shrink-0"
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7 4.5v3M7 9.5v.01"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    <span className="text-sm font-semibold text-foreground/90">
                      {rec.submetricName}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setDismissed((prev) => new Set(prev).add(rec.submetricId))
                    }
                    className="text-muted-foreground hover:text-foreground/70 transition-colors p-0.5 cursor-pointer"
                    aria-label="Dismiss"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M3 3l6 6M9 3l-6 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-foreground/75 mb-1.5">
                  {rec.message}
                  {rec.suggestedTarget != null && (
                    <span className="text-foreground/90 font-medium">
                      {" "}
                      ({rec.currentTarget} &rarr; {rec.suggestedTarget})
                    </span>
                  )}
                </p>

                <p className="text-xs text-muted-foreground">{rec.evidence}</p>

                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  {rec.metricName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
