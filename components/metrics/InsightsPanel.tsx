/**
 * components/metrics/InsightsPanel.tsx
 *
 * Dashboard panel showing 3-5 smart text insights about the user's metrics.
 */

import type { DashboardInsight } from "@/types";

interface InsightsPanelProps {
  insights: DashboardInsight[];
}

const ICON_COLORS: Record<DashboardInsight["icon"], string> = {
  trophy: "text-yellow-500",
  fire: "text-amber-500",
  warning: "text-red-400",
  target: "text-accent",
  star: "text-yellow-400",
};

function InsightIcon({ icon }: { icon: DashboardInsight["icon"] }) {
  const color = ICON_COLORS[icon];

  switch (icon) {
    case "trophy":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${color}`}>
          <path d="M4 2h8v5a4 4 0 0 1-8 0V2Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 4H2.5a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2H4M12 4h1.5a1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H12" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 11.5V13h4v-1.5M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "fire":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${color}`}>
          <path d="M8 1C8 1 3 5.5 3 9.5C3 12 5.2 14 8 14C10.8 14 13 12 13 9.5C13 5.5 8 1 8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "warning":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${color}`}>
          <path d="M8 2L1.5 13h13L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="0.5" fill="currentColor" />
        </svg>
      );
    case "target":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${color}`}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="0.5" fill="currentColor" />
        </svg>
      );
    case "star":
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`shrink-0 ${color}`}>
          <path d="M8 1.5l2 4.5 4.5.5-3.5 3 1 4.5L8 11.5 3.5 14l1-4.5L1 6.5 5.5 6 8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
  }
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  if (insights.length === 0) return null;

  return (
    <div className="card-gradient rounded-2xl p-6 mb-8">
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
        Insights
      </h2>
      <div className="flex flex-col gap-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-3">
            <InsightIcon icon={insight.icon} />
            <span className="text-sm text-foreground/85 leading-snug">
              {insight.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
