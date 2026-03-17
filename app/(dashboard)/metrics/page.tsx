/**
 * app/(dashboard)/metrics/page.tsx
 *
 * Metrics management page (URL: /metrics)
 * Server Component: fetches metrics with submetrics and scores,
 * passes data to MetricsPageClient for accordion-based CRUD.
 */

import { createClient } from "@/lib/supabase/server";
import {
  getPeriodStart,
  aggregateEntries,
  computeSubmetricScore,
  computeMetricScore,
} from "@/lib/scoring";
import MetricsPageClient from "@/components/metrics/MetricsPageClient";
import type { MetricWithScore } from "@/types";

export default async function MetricsPage() {
  const supabase = await createClient();

  const { data: metrics, error: metricsError } = await supabase
    .from("metrics")
    .select("*, submetrics(*)")
    .order("sort_order");

  if (metricsError || !metrics) {
    console.error("Failed to fetch metrics:", metricsError);
    return <div>Error loading metrics</div>;
  }

  // Compute scores for each metric (same pattern as dashboard)
  const chartCutoff = new Date();
  chartCutoff.setDate(chartCutoff.getDate() - 30);
  const chartCutoffISO = chartCutoff.toISOString();

  const metricsWithScores: MetricWithScore[] = await Promise.all(
    metrics.map(async (metric: any) => {
      const submetricsWithScores = await Promise.all(
        (metric.submetrics || []).map(async (submetric: any) => {
          const { data: allEntries } = await supabase
            .from("submetric_entries")
            .select("*")
            .eq("submetric_id", submetric.id)
            .gte("recorded_at", chartCutoffISO)
            .order("recorded_at");

          const periodStart = getPeriodStart(submetric.tracking_period);
          const periodEntries = (allEntries || []).filter(
            (e: any) => e.recorded_at >= periodStart
          );

          const currentPeriodValue = aggregateEntries(
            periodEntries,
            submetric.aggregation_type
          );
          const score = computeSubmetricScore(submetric, currentPeriodValue);

          return {
            ...submetric,
            currentPeriodValue,
            score,
            entries: allEntries || [],
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

  return <MetricsPageClient metrics={metricsWithScores} />;
}
