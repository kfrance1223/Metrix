/**
 * components/metrics/StreakBadge.tsx
 *
 * Small inline badge showing consecutive-period streak count.
 * Only renders when streak >= 2.
 */

import type { SubmetricStreak } from "@/types";

interface StreakBadgeProps {
  streak?: SubmetricStreak;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (!streak || streak.currentStreak < 2) return null;

  const isActive = streak.isActiveToday;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold leading-none ${
        isActive
          ? "bg-amber-500/15 text-amber-500"
          : "bg-foreground/5 text-muted-foreground"
      }`}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        className={isActive ? "text-amber-500" : "text-muted-foreground"}
      >
        <path
          d="M8 1C8 1 3 5.5 3 9.5C3 12 5.2 14 8 14C10.8 14 13 12 13 9.5C13 5.5 8 1 8 1ZM8 12.5C6.1 12.5 4.5 11 4.5 9.5C4.5 7.2 7 4.3 8 3.2C9 4.3 11.5 7.2 11.5 9.5C11.5 11 9.9 12.5 8 12.5Z"
          fill="currentColor"
        />
      </svg>
      {streak.currentStreak}
    </span>
  );
}
