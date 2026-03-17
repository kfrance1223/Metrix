/**
 * components/metrics/MetricCard.tsx
 *
 * Dashboard summary card for a metric category.
 * Shows a semicircular gauge with the score percentage.
 */

import Link from "next/link";
import type { MetricWithScore } from "@/types";

interface MetricCardProps {
  metric: MetricWithScore;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const scorePercentage = Math.round(metric.score * 100);

  const radius = 50;
  const circumference = Math.PI * radius;
  const offset = circumference - (metric.score * circumference);

  return (
    <Link
      href={`/metrics/${metric.id}`}
      className="block card-gradient rounded-2xl p-6 cursor-pointer transition-all duration-300
        hover:shadow-lg hover:shadow-accent/5"
    >
      <h3 className="text-lg font-bold text-foreground uppercase tracking-wide mb-4">
        {metric.name}
      </h3>

      <div className="flex items-center justify-center">
        <div className="relative w-32 h-20">
          <svg viewBox="0 0 120 70" className="w-full h-full">
            <path d="M 10 65 A 50 50 0 0 1 110 65" className="gauge-track" strokeWidth="8" />
            <path d="M 10 65 A 50 50 0 0 1 110 65" className="gauge-fill" strokeWidth="8"
              stroke={metric.color} strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-3xl font-bold text-glow" style={{ color: metric.color }}>
              {scorePercentage}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
