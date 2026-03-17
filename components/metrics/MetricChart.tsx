/**
 * components/metrics/MetricChart.tsx
 *
 * Time-series line chart for a single metric.
 * Theme-aware with accent colors.
 */
"use client";

import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatDate } from "@/lib/utils";
import type { SubmetricEntry } from "@/types";

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const;

interface MetricChartProps {
  entries: SubmetricEntry[];
  color: string;
}

export default function MetricChart({ entries, color }: MetricChartProps) {
  const [rangeDays, setRangeDays] = useState<number>(30);

  const chartData = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);

    return entries
      .filter((e) => new Date(e.recorded_at) >= cutoff)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((e) => ({ date: formatDate(e.recorded_at), value: e.value }));
  }, [entries, rangeDays]);

  return (
    <div className="card-gradient rounded-2xl p-5">
      <div className="flex gap-2 mb-4">
        {RANGE_OPTIONS.map(({ label, days }) => (
          <button key={label} onClick={() => setRangeDays(days)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
              rangeDays === days
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-input text-muted-foreground hover:text-foreground border border-transparent"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {chartData.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-10">No data in this range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
            <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
            <Tooltip contentStyle={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "12px",
              color: "var(--foreground)",
            }} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2}
              dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
