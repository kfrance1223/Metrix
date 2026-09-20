/**
 * components/metrics/DashboardClient.tsx
 *
 * Client-side wrapper for the dashboard page.
 * Hosts the ambient aurora + grain layers and applies the glass theme
 * scope so all descendant cards pick up the frosted-glass treatment.
 */
"use client";

import Link from "next/link";
import MetricCard from "@/components/metrics/MetricCard";
import DetailedMetricCard from "@/components/metrics/DetailedMetricCard";
import OverallScoreDisplay from "@/components/metrics/OverallScoreDisplay";
import InsightsPanel from "@/components/metrics/InsightsPanel";
import RecommendationsPanel from "@/components/metrics/RecommendationsPanel";
import PersonalizedRecommendationsPanel from "@/components/metrics/PersonalizedRecommendationsPanel";
import type { MetricWithScore, DashboardInsight, ProgressionRecommendation, TargetRecommendationWithContext } from "@/types";

interface DashboardClientProps {
  initialMetrics: MetricWithScore[];
  overallScore: number;
  insights: DashboardInsight[];
  recommendations: ProgressionRecommendation[];
  personalizedRecommendations: TargetRecommendationWithContext[];
  hasProfile: boolean;
}

const CHART_VARIANTS: ("area" | "bar")[] = ["area", "area", "bar"];

export default function DashboardClient({
  initialMetrics,
  overallScore,
  insights,
  recommendations,
  personalizedRecommendations,
  hasProfile,
}: DashboardClientProps) {
  const metrics = initialMetrics;

  return (
    <>
      {/* Ambient background layers */}
      <div className="aurora-layer" aria-hidden>
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>
      <div className="grain-overlay" aria-hidden />

      <div className="glass-theme relative">
        {/* Overall Progress Score — the shrine */}
        <section className="glass-strong relative overflow-hidden p-10 mb-12">
          <div className="shrine-halo" />
          <div className="relative">
            <OverallScoreDisplay score={overallScore} />
          </div>
        </section>

        {/* Insights Panel */}
        <section className="mb-10">
          <InsightsPanel insights={insights} />
        </section>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Categories
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Current period scores across your tracked areas.
              </p>
            </div>
            <Link
              href="/metrics"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                bg-linear-to-b from-accent to-accent-light hover:brightness-110
                text-black transition-all duration-200
                shadow-[0_8px_24px_-8px_var(--accent)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Manage Metrics
            </Link>
          </div>

          {metrics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          ) : (
            <div className="glass flex flex-col items-center justify-center h-48">
              <p className="text-foreground/80 text-lg mb-2 font-display">No categories yet</p>
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

        {/* Detailed Metric Cards with charts */}
        {metrics.length > 0 && (
          <section className="mb-12">
            <div className="mb-5">
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Trends
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Recent activity by category with per-submetric progress.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {metrics.map((metric, index) => (
                <DetailedMetricCard
                  key={`detail-${metric.id}`}
                  metric={metric}
                  chartVariant={CHART_VARIANTS[index % CHART_VARIANTS.length]}
                />
              ))}
            </div>
          </section>
        )}

        {/* Personalized Recommendations Panel */}
        {metrics.length > 0 && (
          <PersonalizedRecommendationsPanel
            recommendations={personalizedRecommendations}
            hasProfile={hasProfile}
          />
        )}

        {/* Progression-based Recommendations Panel */}
        {metrics.length > 0 && (
          <RecommendationsPanel recommendations={recommendations} />
        )}
      </div>
    </>
  );
}
