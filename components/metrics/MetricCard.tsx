/**
 * components/metrics/MetricCard.tsx
 *
 * Dashboard summary card for a metric category.
 * Score numeral + full-width progress bar, then the submetrics that carry
 * the most weight in this category, each with its own mini bar.
 */

import Link from "next/link";
import ProgressBar from "./ProgressBar";
import { getTopSubmetricsByWeight } from "@/lib/scoring";
import type { MetricWithScore } from "@/types";

interface MetricCardProps {
  metric: MetricWithScore;
}

const TOP_SUBMETRIC_COUNT = 3;

export default function MetricCard({ metric }: MetricCardProps) {
  const scorePercentage = Math.round(metric.score * 100);
  const topSubmetrics = getTopSubmetricsByWeight(metric.submetrics, TOP_SUBMETRIC_COUNT);

  return (
    <Link
      href={`/metrics/${metric.id}`}
      className="glass flex flex-col p-6 cursor-pointer group"
      style={{
        // Metric-colored inner glow on hover
        ["--metric-color" as string]: metric.color,
      }}
    >
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {metric.name}
        </h3>
        <div className="flex items-baseline">
          <span
            className="font-display text-3xl font-semibold leading-none text-glow"
            style={{ color: metric.color }}
          >
            {scorePercentage}
          </span>
          <span
            className="font-display text-sm leading-none ml-0.5"
            style={{ color: metric.color, opacity: 0.7 }}
          >
            %
          </span>
        </div>
      </div>

      <ProgressBar
        value={metric.score}
        color={metric.color}
        className="h-2.5"
        label={`${metric.name} score`}
      />

      <div className="mt-5 pt-4 border-t border-card-border/50 flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Top drivers
        </p>
        {topSubmetrics.length > 0 ? (
          topSubmetrics.map(({ submetric, weightShare }) => (
            <div key={submetric.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-foreground/90 truncate">{submetric.name}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {Math.round(submetric.score * 100)}%
                  <span className="opacity-60"> · {Math.round(weightShare * 100)}% weight</span>
                </span>
              </div>
              <ProgressBar value={submetric.score} color={metric.color} className="h-1" />
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No items yet</p>
        )}
      </div>
    </Link>
  );
}
