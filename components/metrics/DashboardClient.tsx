/**
 * components/metrics/DashboardClient.tsx
 *
 * Client-side wrapper for the dashboard page.
 * Hosts the ambient aurora + grain layers and applies the glass theme
 * scope so all descendant cards pick up the frosted-glass treatment.
 *
 * Hierarchy: header → overview stats → metric grid → activity/reflection,
 * with insights and recommendations below the fold.
 */
"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewStats from "@/components/dashboard/OverviewStats";
import YourMetricsGrid from "@/components/dashboard/YourMetricsGrid";
import RecentActivity from "@/components/dashboard/RecentActivity";
import LatestReflection from "@/components/dashboard/LatestReflection";
import InsightsPanel from "@/components/metrics/InsightsPanel";
import RecommendationsPanel from "@/components/metrics/RecommendationsPanel";
import PersonalizedRecommendationsPanel from "@/components/metrics/PersonalizedRecommendationsPanel";
import type {
  MetricWithScore,
  DashboardInsight,
  ProgressionRecommendation,
  TargetRecommendationWithContext,
  OverviewStats as OverviewStatsData,
  ActivityFeedItem,
} from "@/types";

interface DashboardClientProps {
  displayName: string | null;
  initialMetrics: MetricWithScore[];
  stats: OverviewStatsData;
  activity: ActivityFeedItem[];
  insights: DashboardInsight[];
  recommendations: ProgressionRecommendation[];
  personalizedRecommendations: TargetRecommendationWithContext[];
  hasProfile: boolean;
}

export default function DashboardClient({
  displayName,
  initialMetrics,
  stats,
  activity,
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
        <DashboardHeader name={displayName} />

        <OverviewStats stats={stats} />

        <YourMetricsGrid metrics={metrics} />

        {/* Recent activity + latest reflection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
          <RecentActivity items={activity} />
          <LatestReflection />
        </div>

        {/* Below the fold: deeper analysis */}
        {metrics.length > 0 && (
          <div>
            <section className="mb-10">
              <InsightsPanel insights={insights} />
            </section>

            <PersonalizedRecommendationsPanel
              recommendations={personalizedRecommendations}
              hasProfile={hasProfile}
            />

            <RecommendationsPanel recommendations={recommendations} />
          </div>
        )}
      </div>
    </>
  );
}
