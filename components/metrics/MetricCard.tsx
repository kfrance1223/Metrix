/**
 * components/metrics/MetricCard.tsx
 *
 * Dashboard summary card for a metric category.
 * Full radial ring via HeroUI ProgressCircle sits inside a glass panel;
 * the score numeral is set in the display serif.
 */

import Link from "next/link";
import { ProgressCircle } from "@heroui/react";
import type { MetricWithScore } from "@/types";

interface MetricCardProps {
  metric: MetricWithScore;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const scorePercentage = Math.round(metric.score * 100);

  return (
    <Link
      href={`/metrics/${metric.id}`}
      className="glass block p-6 cursor-pointer group"
      style={{
        // Metric-colored inner glow on hover
        ["--metric-color" as string]: metric.color,
      }}
    >
      <div className="flex items-baseline justify-between mb-6">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {metric.name}
        </h3>
        <span
          className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
        >
          score
        </span>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative">
          <ProgressCircle
            aria-label={`${metric.name} score`}
            value={scorePercentage}
            className="size-32"
          >
            <ProgressCircle.Track strokeWidth={3} viewBox="0 0 36 36">
              <ProgressCircle.TrackCircle
                cx={18}
                cy={18}
                r={16}
                strokeWidth={3}
                style={{ stroke: "var(--gauge-track)", opacity: 0.5 }}
              />
              <ProgressCircle.FillCircle
                cx={18}
                cy={18}
                r={16}
                strokeWidth={3}
                strokeLinecap="round"
                style={{ stroke: metric.color }}
              />
            </ProgressCircle.Track>
          </ProgressCircle>
          <div className="absolute inset-0 flex items-baseline justify-center pt-2">
            <span
              className="font-display text-4xl font-semibold leading-none text-glow"
              style={{ color: metric.color }}
            >
              {scorePercentage}
            </span>
            <span
              className="font-display text-base leading-none mt-1"
              style={{ color: metric.color, opacity: 0.7 }}
            >
              %
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
