/**
 * app/(dashboard)/page.tsx
 *
 * Dashboard — the main landing page (URL: /)
 *
 * Server Component: fetches metrics with submetrics, computes scores for
 * the current tracking periods, and passes the data to DashboardClient.
 *
 * Entries are fetched for the last 30 days (rather than just the current
 * tracking period) so that the dashboard charts have enough data points.
 * The current-period score is computed by filtering entries to the
 * relevant period on the server before aggregation.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPeriodStart,
  aggregateEntries,
  computeSubmetricScore,
  computeMetricScore,
  computeOverallScore,
} from "@/lib/scoring";
import {
  computeSubmetricStreak,
  generateDashboardInsights,
  generateProgressionRecommendations,
} from "@/lib/insights";
import DashboardClient from "@/components/metrics/DashboardClient";
import { getPersonalizedRecommendations, getUserProfile } from "@/lib/actions";
import type { MetricWithScore } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch all metrics with their submetrics
  const { data: metrics, error: metricsError } = await supabase
    .from("metrics")
    .select("*, submetrics(*)")
    .order("sort_order");

  if (metricsError || !metrics) {
    console.error("Failed to fetch metrics:", metricsError);
    return <div>Error loading metrics</div>;
  }

  // Onboarding redirect: if no metrics and not yet onboarded, go to onboarding
  if (metrics.length === 0) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && !user.user_metadata?.onboarding_completed) {
      redirect("/onboarding");
    }
  }

  // Chart data cutoff: 30 days ago
  const chartCutoff = new Date();
  chartCutoff.setDate(chartCutoff.getDate() - 30);
  const chartCutoffISO = chartCutoff.toISOString();

  // 2. For each submetric, fetch entries (30-day window) and compute scores
  const metricsWithScores: MetricWithScore[] = await Promise.all(
    metrics.map(async (metric: any) => {
      const submetricsWithScores = await Promise.all(
        (metric.submetrics || []).map(async (submetric: any) => {
          // Fetch last 30 days of entries for chart display
          const { data: allEntries, error: entriesError } = await supabase
            .from("submetric_entries")
            .select("*")
            .eq("submetric_id", submetric.id)
            .gte("recorded_at", chartCutoffISO)
            .order("recorded_at");

          if (entriesError) {
            console.error(
              `Failed to fetch entries for submetric ${submetric.id}:`,
              entriesError
            );
          }

          // Filter to current tracking period for score computation
          const periodStart = getPeriodStart(submetric.tracking_period);
          const periodEntries = (allEntries || []).filter(
            (e: any) => e.recorded_at >= periodStart
          );

          const currentPeriodValue = aggregateEntries(
            periodEntries,
            submetric.aggregation_type
          );
          const score = computeSubmetricScore(
            submetric,
            currentPeriodValue
          );

          return {
            ...submetric,
            currentPeriodValue,
            score,
            entries: allEntries || [], // full 30-day range for charts
          };
        })
      );

      const score = computeMetricScore(submetricsWithScores);

      return {
        ...metric,
        submetrics: submetricsWithScores,
        score,
      };
    })
  );

  // Compute streaks for each submetric
  for (const metric of metricsWithScores) {
    for (const sub of metric.submetrics) {
      sub.streak = computeSubmetricStreak(sub, sub.entries);
    }
  }

  const overallScore = computeOverallScore(metricsWithScores);
  const insights = generateDashboardInsights(metricsWithScores);
  const recommendations = generateProgressionRecommendations(metricsWithScores);

  // Fetch personalized recommendations and profile status
  const [personalizedRecs, profile] = await Promise.all([
    getPersonalizedRecommendations().catch(() => []),
    getUserProfile().catch(() => null),
  ]);

  return (
    <DashboardClient
      initialMetrics={metricsWithScores}
      overallScore={overallScore}
      insights={insights}
      recommendations={recommendations}
      personalizedRecommendations={personalizedRecs}
      hasProfile={!!profile}
    />
  );
}
