/**
 * components/metrics/StreakBadge.tsx
 *
 * Small inline chip showing consecutive-period streak count.
 * Only renders when streak >= 2.
 */

import { Chip } from "@heroui/react";
import type { SubmetricStreak } from "@/types";

interface StreakBadgeProps {
  streak?: SubmetricStreak;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (!streak || streak.currentStreak < 2) return null;

  const isActive = streak.isActiveToday;

  return (
    <Chip
      size="sm"
      variant="soft"
      color={isActive ? "warning" : "default"}
    >
      <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1C8 1 3 5.5 3 9.5C3 12 5.2 14 8 14C10.8 14 13 12 13 9.5C13 5.5 8 1 8 1ZM8 12.5C6.1 12.5 4.5 11 4.5 9.5C4.5 7.2 7 4.3 8 3.2C9 4.3 11.5 7.2 11.5 9.5C11.5 11 9.9 12.5 8 12.5Z"
          fill="currentColor"
        />
      </svg>
      <Chip.Label>{streak.currentStreak}</Chip.Label>
    </Chip>
  );
}
