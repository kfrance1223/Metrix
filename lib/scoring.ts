/**
 * lib/scoring.ts
 *
 * Pure utility functions for the hierarchical metric scoring pipeline.
 * No I/O or side effects — all functions are deterministic.
 * Called from Server Components to compute scores before rendering.
 */

import type {
  UnitType,
  TrackingPeriod,
  AggregationType,
  Submetric,
  SubmetricEntry,
  SubmetricWithScore,
  MetricWithScore,
} from "@/types";

/**
 * Normalize a raw value to a 0.0–1.0 score given a unit type and target.
 * Boolean values are expected as 0 or 1 (target is always 1).
 * Percentage values are assumed 0–100 (divide by 100).
 */
export function normalizeValue(
  value: number,
  target: number,
  unitType: UnitType
): number {
  if (unitType === "boolean") {
    return value >= 1 ? 1 : 0;
  }
  if (unitType === "percentage") {
    return Math.min(1, Math.max(0, value / 100));
  }
  // For 'number', 'time', 'currency': cap at 1.0 if exceeded
  return Math.min(1, Math.max(0, value / target));
}

/**
 * Get the start of the current tracking period as an ISO string.
 * Used in Supabase queries to filter entries within the period only.
 *
 * Weekly periods start on Sunday (getDay() === 0).
 * Monthly periods start on the 1st of the month.
 */
export function getPeriodStart(period: TrackingPeriod): string {
  const now = new Date();

  if (period === "daily") {
    now.setHours(0, 0, 0, 0);
  } else if (period === "weekly") {
    const dayOfWeek = now.getDay(); // 0 = Sunday
    now.setDate(now.getDate() - dayOfWeek);
    now.setHours(0, 0, 0, 0);
  } else if (period === "monthly") {
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
  }

  return now.toISOString();
}

/**
 * Aggregate entries for a given submetric within its tracking period.
 * Returns the aggregated value (sum or latest).
 */
export function aggregateEntries(
  entries: SubmetricEntry[],
  aggregationType: AggregationType
): number {
  if (entries.length === 0) return 0;

  if (aggregationType === "latest") {
    const sorted = [...entries].sort(
      (a, b) =>
        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    );
    return sorted[0].value;
  }

  // 'sum'
  return entries.reduce((sum, e) => sum + e.value, 0);
}

/**
 * Compute a 0–1 score for a single submetric given its aggregated value.
 */
export function computeSubmetricScore(
  submetric: Submetric,
  currentPeriodValue: number
): number {
  return normalizeValue(
    currentPeriodValue,
    submetric.target_value,
    submetric.unit_type
  );
}

/**
 * Compute a 0–1 score for a parent metric as the weighted average of its submetrics.
 * If weights don't sum to 100, they are normalized anyway.
 */
export function computeMetricScore(
  submetrics: SubmetricWithScore[]
): number {
  if (submetrics.length === 0) return 0;

  const totalWeight = submetrics.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = submetrics.reduce(
    (sum, s) => sum + s.score * s.weight,
    0
  );

  return weightedSum / totalWeight;
}

/**
 * Compute the overall "life score" as a 0–1 value.
 * Weighted average of all parent metric scores.
 */
export function computeOverallScore(metrics: MetricWithScore[]): number {
  if (metrics.length === 0) return 0;

  const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = metrics.reduce(
    (sum, m) => sum + m.score * m.weight,
    0
  );

  return weightedSum / totalWeight;
}
