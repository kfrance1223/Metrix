/**
 * components/dashboard/OverviewStats.tsx
 *
 * Four-up stat row: overall score, submetrics on target, metric count,
 * and daily streak. The at-a-glance "where do I stand today" block.
 */

import type { OverviewStats as OverviewStatsData } from "@/types";

interface OverviewStatsProps {
  stats: OverviewStatsData;
}

interface StatTileProps {
  value: string;
  suffix?: string;
  label: string;
  accent?: boolean;
}

function StatTile({ value, suffix, label, accent }: StatTileProps) {
  return (
    <div className="glass p-5">
      <div className="flex items-baseline gap-1">
        <span
          className={`font-display text-4xl font-semibold leading-none ${
            accent ? "text-accent text-glow" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-muted-foreground">{suffix}</span>
        )}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export default function OverviewStats({ stats }: OverviewStatsProps) {
  const { overallScore, hitRatio, metricCount, dailyStreak } = stats;

  return (
    <section className="mb-10">
      <h2 className="sr-only">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          value={`${Math.round(overallScore * 100)}`}
          suffix="%"
          label="Overall score"
          accent
        />
        <StatTile
          value={`${hitRatio.hit}`}
          suffix={`/ ${hitRatio.total}`}
          label="On target"
        />
        <StatTile
          value={`${metricCount}`}
          label={metricCount === 1 ? "Metric" : "Metrics"}
        />
        <StatTile
          value={`${dailyStreak}`}
          suffix={dailyStreak === 1 ? "day" : "days"}
          label="Daily streak"
        />
      </div>
    </section>
  );
}
