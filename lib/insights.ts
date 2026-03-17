/**
 * lib/insights.ts
 *
 * Pure functions for streaks, dashboard insights, and progression recommendations.
 * No I/O — all computation derives from the 30-day entry window already fetched.
 */

import { aggregateEntries, normalizeValue } from "./scoring";
import type {
  TrackingPeriod,
  SubmetricEntry,
  SubmetricWithScore,
  MetricWithScore,
  SubmetricStreak,
  DashboardInsight,
  ProgressionRecommendation,
} from "@/types";

// ── Period boundaries ────────────────────────────────────────────────

interface PeriodWindow {
  start: Date;
  end: Date;
}

/**
 * Returns period windows covering the entry date range, newest first.
 */
export function getPeriodBoundaries(
  period: TrackingPeriod,
  entries: SubmetricEntry[],
  referenceDate?: Date
): PeriodWindow[] {
  if (entries.length === 0) return [];

  const ref = referenceDate ? new Date(referenceDate) : new Date();
  const windows: PeriodWindow[] = [];

  // Find the earliest entry date
  const earliest = entries.reduce(
    (min, e) => {
      const d = new Date(e.recorded_at);
      return d < min ? d : min;
    },
    new Date(entries[0].recorded_at)
  );

  // Generate windows backwards from reference date until we pass the earliest entry
  let cursor = new Date(ref);

  for (let safety = 0; safety < 365; safety++) {
    const { start, end } = getPeriodForDate(period, cursor);
    windows.push({ start, end });

    if (start <= earliest) break;

    // Move cursor to just before this period's start
    cursor = new Date(start.getTime() - 1);
  }

  return windows;
}

function getPeriodForDate(period: TrackingPeriod, date: Date): PeriodWindow {
  const d = new Date(date);

  if (period === "daily") {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (period === "weekly") {
    const start = new Date(d);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  // monthly
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return { start, end };
}

// ── Streaks ──────────────────────────────────────────────────────────

export function computeSubmetricStreak(
  submetric: SubmetricWithScore,
  entries: SubmetricEntry[],
  referenceDate?: Date
): SubmetricStreak {
  const result: SubmetricStreak = {
    submetricId: submetric.id,
    currentStreak: 0,
    longestStreak: 0,
    isActiveToday: false,
  };

  const windows = getPeriodBoundaries(
    submetric.tracking_period,
    entries,
    referenceDate
  );
  if (windows.length === 0) return result;

  function meetsTarget(periodEntries: SubmetricEntry[]): boolean {
    const aggregated = aggregateEntries(periodEntries, submetric.aggregation_type);
    if (submetric.unit_type === "boolean") {
      return aggregated >= 1;
    }
    return normalizeValue(aggregated, submetric.target_value, submetric.unit_type) >= 1.0;
  }

  // Check current (possibly incomplete) period
  const currentPeriodEntries = entries.filter((e) => {
    const d = new Date(e.recorded_at);
    return d >= windows[0].start && d < windows[0].end;
  });
  result.isActiveToday = currentPeriodEntries.length > 0 && meetsTarget(currentPeriodEntries);

  // Count streaks from most recent backwards
  let streakCounting = true;
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    const periodEntries = entries.filter((e) => {
      const d = new Date(e.recorded_at);
      return d >= w.start && d < w.end;
    });

    // Skip current incomplete period for streak counting — use isActiveToday instead
    if (i === 0) {
      if (result.isActiveToday) {
        currentStreak = 1;
        runningStreak = 1;
      } else {
        streakCounting = false;
      }
      continue;
    }

    const met = periodEntries.length > 0 && meetsTarget(periodEntries);

    if (met) {
      runningStreak++;
      if (streakCounting) currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, runningStreak);
      runningStreak = 0;
      streakCounting = false;
    }
  }
  longestStreak = Math.max(longestStreak, runningStreak);

  result.currentStreak = currentStreak;
  result.longestStreak = Math.max(longestStreak, currentStreak);

  return result;
}

// ── Previous period score ────────────────────────────────────────────

export function computePreviousPeriodScore(
  submetric: SubmetricWithScore,
  entries: SubmetricEntry[],
  referenceDate?: Date
): number {
  const windows = getPeriodBoundaries(
    submetric.tracking_period,
    entries,
    referenceDate
  );
  // windows[0] = current, windows[1] = previous
  if (windows.length < 2) return 0;

  const prev = windows[1];
  const periodEntries = entries.filter((e) => {
    const d = new Date(e.recorded_at);
    return d >= prev.start && d < prev.end;
  });

  const aggregated = aggregateEntries(periodEntries, submetric.aggregation_type);
  return normalizeValue(aggregated, submetric.target_value, submetric.unit_type);
}

// ── Dashboard Insights ───────────────────────────────────────────────

export function generateDashboardInsights(
  metrics: MetricWithScore[],
  referenceDate?: Date
): DashboardInsight[] {
  if (metrics.length === 0) return [];

  const candidates: DashboardInsight[] = [];

  // Strongest metric
  const strongest = metrics.reduce((best, m) =>
    m.score > best.score ? m : best
  );
  if (strongest.score >= 0.7) {
    candidates.push({
      type: "strength",
      icon: "trophy",
      message: `${strongest.name} is your strongest category (${Math.round(strongest.score * 100)}%)`,
      metricId: strongest.id,
      priority: 2,
    });
  }

  // Perfect scores
  for (const m of metrics) {
    if (m.score === 1) {
      candidates.push({
        type: "perfect",
        icon: "star",
        message: `Perfect score on ${m.name}!`,
        metricId: m.id,
        priority: 1,
      });
    }
  }

  // Biggest decline (current vs previous period)
  for (const m of metrics) {
    let currentTotal = 0;
    let prevTotal = 0;
    let weightSum = 0;

    for (const sub of m.submetrics) {
      const prevScore = computePreviousPeriodScore(sub, sub.entries, referenceDate);
      currentTotal += sub.score * sub.weight;
      prevTotal += prevScore * sub.weight;
      weightSum += sub.weight;
    }

    if (weightSum === 0) continue;
    const currentAvg = currentTotal / weightSum;
    const prevAvg = prevTotal / weightSum;
    const delta = currentAvg - prevAvg;

    if (delta <= -0.15) {
      const worstSub = m.submetrics.reduce((worst, s) => {
        const ps = computePreviousPeriodScore(s, s.entries, referenceDate);
        const d = s.score - ps;
        const wd = worst.score - computePreviousPeriodScore(worst, worst.entries, referenceDate);
        return d < wd ? s : worst;
      });
      candidates.push({
        type: "decline",
        icon: "warning",
        message: `${m.name} dropped ${Math.abs(Math.round(delta * 100))}% — check ${worstSub.name}`,
        metricId: m.id,
        priority: 3,
      });
    }
  }

  // Streak highlights
  for (const m of metrics) {
    for (const sub of m.submetrics) {
      if (!sub.streak) continue;
      const threshold = sub.tracking_period === "daily" ? 5 : 3;
      if (sub.streak.currentStreak >= threshold) {
        const periodLabel =
          sub.tracking_period === "daily"
            ? "day"
            : sub.tracking_period === "weekly"
              ? "week"
              : "month";
        candidates.push({
          type: "streak_highlight",
          icon: "fire",
          message: `You've hit ${sub.name} every ${periodLabel} for ${sub.streak.currentStreak} ${periodLabel}s`,
          metricId: m.id,
          priority: 2,
        });
      }
    }
  }

  // Attention needed
  const belowHalf = metrics.filter((m) => m.score < 0.5);
  if (belowHalf.length >= 2) {
    candidates.push({
      type: "attention",
      icon: "target",
      message: `${belowHalf.length} metrics need attention`,
      priority: 4,
    });
  }

  // Sort by priority (lower = first) and return top 5
  candidates.sort((a, b) => a.priority - b.priority);
  return candidates.slice(0, 5);
}

// ── Progression Recommendations ──────────────────────────────────────

export function generateProgressionRecommendations(
  metrics: MetricWithScore[],
  referenceDate?: Date
): ProgressionRecommendation[] {
  const recs: ProgressionRecommendation[] = [];

  for (const metric of metrics) {
    for (const sub of metric.submetrics) {
      const windows = getPeriodBoundaries(
        sub.tracking_period,
        sub.entries,
        referenceDate
      );

      // Skip current period, use only completed periods
      const completedWindows = windows.slice(1);
      if (completedWindows.length < 2) continue;

      // Limit to last 4 completed periods
      const recentWindows = completedWindows.slice(0, 4);

      const ratios: number[] = [];
      const aggregatedValues: number[] = [];

      for (const w of recentWindows) {
        const periodEntries = sub.entries.filter((e) => {
          const d = new Date(e.recorded_at);
          return d >= w.start && d < w.end;
        });

        if (periodEntries.length === 0) {
          ratios.push(0);
          aggregatedValues.push(0);
          continue;
        }

        const agg = aggregateEntries(periodEntries, sub.aggregation_type);
        aggregatedValues.push(agg);

        if (sub.unit_type === "boolean") {
          ratios.push(agg >= 1 ? 1 : 0);
        } else {
          ratios.push(sub.target_value > 0 ? agg / sub.target_value : 0);
        }
      }

      const exceededCount = ratios.filter((r) => r >= 1.0).length;
      const failedCount = ratios.filter((r) => r < 0.3).length;

      // Raise target: exceeded in ≥ 75% of periods (skip booleans)
      if (
        sub.unit_type !== "boolean" &&
        exceededCount / recentWindows.length >= 0.75
      ) {
        const avg = aggregatedValues.reduce((a, b) => a + b, 0) / aggregatedValues.length;
        // Round to a clean number
        const suggested = Math.round(avg / 5) * 5 || Math.round(avg);

        if (suggested > sub.target_value) {
          recs.push({
            submetricId: sub.id,
            submetricName: sub.name,
            metricName: metric.name,
            metricColor: metric.color,
            type: "raise_target",
            currentTarget: sub.target_value,
            suggestedTarget: suggested,
            message: `Consider raising your ${sub.name} target`,
            evidence: `Exceeded target ${exceededCount} of last ${recentWindows.length} ${sub.tracking_period === "daily" ? "days" : sub.tracking_period === "weekly" ? "weeks" : "months"}`,
          });
        }
      }

      // Lower target / attention: failed in ≥ 75% of periods
      if (failedCount / recentWindows.length >= 0.75) {
        recs.push({
          submetricId: sub.id,
          submetricName: sub.name,
          metricName: metric.name,
          metricColor: metric.color,
          type: "attention",
          currentTarget: sub.target_value,
          message: `${sub.name} target may be too ambitious`,
          evidence: `Below 30% of target ${failedCount} of last ${recentWindows.length} ${sub.tracking_period === "daily" ? "days" : sub.tracking_period === "weekly" ? "weeks" : "months"}`,
        });
      }
    }
  }

  return recs;
}
