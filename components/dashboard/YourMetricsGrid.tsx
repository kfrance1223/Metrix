/**
 * components/dashboard/YourMetricsGrid.tsx
 *
 * "Your Metrics" section — header plus the MetricCard grid.
 */

import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import MetricCard from "@/components/metrics/MetricCard";
import type { MetricWithScore } from "@/types";

interface YourMetricsGridProps {
  metrics: MetricWithScore[];
}

export default function YourMetricsGrid({ metrics }: YourMetricsGridProps) {
  return (
    <section className="mb-10">
      <div className="flex items-end justify-between mb-5">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Your Metrics
        </h2>
        {/* TODO(v1.1): wire up filtering / view toggle */}
        <button
          type="button"
          disabled
          title="Filters coming soon"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-muted-foreground
            border border-card-border opacity-60 cursor-not-allowed"
        >
          <SlidersHorizontal size={12} />
          Filters
        </button>
      </div>

      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      ) : (
        <div className="glass flex flex-col items-center justify-center h-48">
          <p className="text-foreground/80 text-lg mb-2 font-display">No metrics yet</p>
          <p className="text-muted-foreground text-sm mb-3">
            Set up your life metrics to start tracking.
          </p>
          <Link
            href="/metrics"
            className="text-accent hover:text-accent-light text-sm font-medium transition-colors"
          >
            Go to Metrics &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
