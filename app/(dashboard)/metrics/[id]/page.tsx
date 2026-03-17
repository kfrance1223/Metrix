/**
 * app/(dashboard)/metrics/[id]/page.tsx
 *
 * Metric detail page — shows a parent metric with all its submetrics,
 * including charts and entry logging.
 */

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getPeriodStart,
  aggregateEntries,
  computeSubmetricScore,
} from "@/lib/scoring";
import MetricChart from "@/components/metrics/MetricChart";
import EntryForm from "@/components/metrics/EntryForm";
import EntryList from "@/components/metrics/EntryList";
import type { SubmetricWithScore } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MetricDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: metric, error: metricError } = await supabase
    .from("metrics")
    .select("*, submetrics(*)")
    .eq("id", id)
    .single();

  if (metricError || !metric) {
    notFound();
  }

  const submetricIds = (metric.submetrics || []).map((s: any) => s.id);

  let allEntries: any[] = [];
  if (submetricIds.length > 0) {
    const { data, error: entriesError } = await supabase
      .from("submetric_entries")
      .select("*")
      .in("submetric_id", submetricIds)
      .order("recorded_at", { ascending: false });

    if (entriesError) {
      console.error("Failed to fetch entries:", entriesError);
    } else {
      allEntries = data || [];
    }
  }

  const submetricsWithData: SubmetricWithScore[] = (metric.submetrics || []).map(
    (submetric: any) => {
      const submetricEntries = allEntries.filter((e) => e.submetric_id === submetric.id);
      const periodStart = getPeriodStart(submetric.tracking_period);
      const currentPeriodEntries = submetricEntries.filter(
        (e) => new Date(e.recorded_at) >= new Date(periodStart)
      );
      const currentPeriodValue = aggregateEntries(currentPeriodEntries, submetric.aggregation_type);
      const score = computeSubmetricScore(submetric, currentPeriodValue);

      return { ...submetric, currentPeriodValue, score, entries: submetricEntries };
    }
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: metric.color }}>
          {metric.name}
        </h1>
        <p className="text-muted-foreground text-sm">
          {submetricsWithData.length} tracked item{submetricsWithData.length !== 1 ? "s" : ""}
        </p>
      </div>

      {submetricsWithData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {submetricsWithData.map((submetric) => (
            <div key={submetric.id} className="flex flex-col gap-4">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg font-semibold text-foreground">{submetric.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {submetric.unit_label && `(${submetric.unit_label})`}
                </span>
                <span className="ml-auto text-2xl font-bold text-accent text-glow">
                  {Math.round(submetric.score * 100)}%
                </span>
              </div>
              <MetricChart entries={submetric.entries} color={metric.color} />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">History</h3>
                <EntryList entries={submetric.entries} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-gradient rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">No items tracked yet in this category.</p>
        </div>
      )}

      {submetricsWithData.length > 0 && (
        <div className="mt-8 border-t border-card-border pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Log New Entry</h2>
          <EntryForm submetrics={submetricsWithData} onSubmit={() => {}} />
        </div>
      )}
    </div>
  );
}
