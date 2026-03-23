/**
 * components/metrics/DashboardClient.tsx
 *
 * Client-side wrapper for the dashboard page.
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
      {/* Overall Progress Score */}
      <div className="score-gradient rounded-2xl p-8 mb-8">
        <OverallScoreDisplay score={overallScore} />
      </div>

      {/* Insights Panel */}
      <InsightsPanel insights={insights} />

      {/* Selected Metrics Progress Board */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
          Selected Metrics Progress Board
        </h2>
        <Link
          href="/metrics"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-linear-to-r from-accent to-accent-light hover:brightness-110
            text-black transition-all duration-200
            shadow-lg shadow-accent/15 hover:shadow-accent/25"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Manage Metrics
        </Link>
      </div>

      {/* Metric summary cards */}
      {metrics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      ) : (
        <div className="score-gradient rounded-2xl flex flex-col items-center justify-center h-48 mb-10">
          <p className="text-foreground/70 text-lg mb-2">No categories yet</p>
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

      {/* Detailed Metric Cards with charts */}
      {metrics.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-5">
            Detailed Metric Cards
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {metrics.map((metric, index) => (
              <DetailedMetricCard
                key={`detail-${metric.id}`}
                metric={metric}
                chartVariant={CHART_VARIANTS[index % CHART_VARIANTS.length]}
              />
            ))}
          </div>
        </>
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
    </>
  );
}
