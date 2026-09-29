/**
 * components/dashboard/RecentActivity.tsx
 *
 * Feed of the most recent entries across all submetrics.
 * Entries logged via the date picker are stored at midnight, so the feed
 * uses day-level labels (Today / Yesterday / date) rather than "2h ago".
 */
"use client";

import type { ActivityFeedItem } from "@/types";

interface RecentActivityProps {
  items: ActivityFeedItem[];
}

function formatValue(item: ActivityFeedItem): string {
  const { value, unitType, unitLabel } = item;
  if (unitType === "boolean") return value >= 1 ? "Done" : "Missed";
  if (unitType === "currency") return `${unitLabel ?? "$"}${value.toLocaleString()}`;
  if (unitType === "percentage") return `${value}%`;
  return unitLabel ? `${value.toLocaleString()} ${unitLabel}` : value.toLocaleString();
}

function formatDay(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - day.getTime()) / 86_400_000);

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className="glass p-6 h-full">
      <h2 className="font-display text-xl font-semibold text-foreground mb-4">
        Recent Activity
      </h2>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing logged in the last 30 days.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-card-border/60">
          {items.map((item) => (
            <li key={item.entryId} className="flex items-center gap-3 py-2.5">
              <span
                aria-hidden
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: item.metricColor }}
              />
              <span className="text-sm text-foreground truncate">
                {item.submetricName}
              </span>
              <span className="text-sm font-medium text-foreground/90 ml-auto shrink-0">
                {formatValue(item)}
              </span>
              <span
                className="text-xs text-muted-foreground w-16 text-right shrink-0"
                suppressHydrationWarning
              >
                {formatDay(item.recordedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
