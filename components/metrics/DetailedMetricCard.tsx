/**
 * components/metrics/DetailedMetricCard.tsx
 *
 * Dashboard card showing an embedded chart with DAY/WEEK/MONTH toggle
 * and submetric progress rows with trend indicators.
 */
"use client";

import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import ProgressBar from "./ProgressBar";
import StreakBadge from "./StreakBadge";
import type { MetricWithScore, SubmetricEntry } from "@/types";

const RANGE_OPTIONS = [
  { label: "DAY", days: 1 },
  { label: "WEEK", days: 7 },
  { label: "MONTH", days: 30 },
] as const;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DetailedMetricCardProps {
  metric: MetricWithScore;
  chartVariant?: "area" | "bar";
}

export default function DetailedMetricCard({
  metric,
  chartVariant = "area",
}: DetailedMetricCardProps) {
  const [rangeDays, setRangeDays] = useState<number>(7);

  const chartData = useMemo(() => {
    const allEntries: SubmetricEntry[] = metric.submetrics.flatMap((s) => s.entries);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);
    const filtered = allEntries.filter((e) => new Date(e.recorded_at) >= cutoff);

    const byDate = new Map<string, number[]>();
    filtered.forEach((entry) => {
      const dateStr = entry.recorded_at.split("T")[0];
      if (!byDate.has(dateStr)) byDate.set(dateStr, []);
      byDate.get(dateStr)!.push(entry.value);
    });

    const points: { label: string; value: number }[] = [];

    if (rangeDays === 7) {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const vals = byDate.get(dateStr) || [];
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        points.push({ label: DAY_NAMES[d.getDay()], value: Math.round(avg) });
      }
    } else if (rangeDays === 30) {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const vals = byDate.get(dateStr) || [];
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        points.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: Math.round(avg) });
      }
    } else {
      const today = new Date().toISOString().split("T")[0];
      const todayEntries = filtered
        .filter((e) => e.recorded_at.startsWith(today))
        .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
      todayEntries.forEach((e) => {
        const time = new Date(e.recorded_at);
        points.push({ label: `${time.getHours()}:${String(time.getMinutes()).padStart(2, "0")}`, value: e.value });
      });
    }
    return points;
  }, [metric.submetrics, rangeDays]);

  const getTrend = (score: number): "up" | "down" | "neutral" => {
    if (score >= 0.6) return "up";
    if (score <= 0.4) return "down";
    return "neutral";
  };

  const gradientId = `chart-fill-${metric.id}`;

  // Theme-aware chart colors
  const gridColor = "var(--card-border)";
  const axisColor = "var(--muted-foreground)";
  const tooltipBg = "var(--card-bg)";
  const tooltipBorder = "var(--card-border)";
  const tooltipText = "var(--foreground)";

  return (
    <div className="card-gradient rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold uppercase tracking-wide" style={{ color: metric.color }}>
          {metric.name}
        </h3>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map(({ label, days }) => (
            <button key={label} onClick={() => setRangeDays(days)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase cursor-pointer transition-all duration-200
                ${rangeDays === days
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 mb-4">
        {chartData.some((d) => d.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartVariant === "bar" ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", color: tooltipText, fontSize: 12 }} />
                <Bar dataKey="value" fill={metric.color} radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            ) : (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "8px", color: tooltipText, fontSize: 12 }} />
                <Area type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2}
                  fill={`url(#${gradientId})`} dot={{ fill: metric.color, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No data for this period
          </div>
        )}
      </div>

      {/* Submetric rows */}
      {metric.submetrics.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {metric.submetrics.map((sub) => {
            const trend = getTrend(sub.score);
            return (
              <div key={sub.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground/80 flex items-center gap-1.5">
                    {sub.name}
                    <StreakBadge streak={sub.streak} />
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground/90">{Math.round(sub.score * 100)}%</span>
                    {trend === "up" && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-emerald-400" aria-label="Trending up">
                        <path d="M6 9V3M6 3l3 3M6 3L3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {trend === "down" && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-red-400" aria-label="Trending down">
                        <path d="M6 3v6M6 9l3-3M6 9L3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <ProgressBar value={sub.score} color={metric.color} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No items tracked yet.</p>
      )}
    </div>
  );
}
