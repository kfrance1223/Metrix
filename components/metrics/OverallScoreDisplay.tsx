/**
 * components/metrics/OverallScoreDisplay.tsx
 *
 * Large semicircular gauge for the overall "life score" on the dashboard.
 * Uses the green accent palette gradient arc.
 */

"use client";

interface OverallScoreDisplayProps {
  score: number; // 0.0 to 1.0
}

export default function OverallScoreDisplay({
  score,
}: OverallScoreDisplayProps) {
  const percentage = Math.round(score * 100);

  const cx = 150;
  const cy = 130;
  const radius = 100;
  const strokeWidth = 12;

  const startX = cx - radius;
  const startY = cy;
  const endX = cx + radius;
  const endY = cy;

  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  const halfCircumference = Math.PI * radius;
  const fillLength = halfCircumference * score;
  const dashOffset = halfCircumference - fillLength;

  const gradientId = "gauge-gradient";

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">
        Overall Progress Score
      </h2>

      <div className="relative" style={{ width: 300, height: 160 }}>
        <svg viewBox="0 0 300 160" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="50%" stopColor="var(--accent-light)" />
              <stop offset="100%" stopColor="var(--accent-glow)" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path d={arcPath} fill="none" stroke="var(--gauge-track)" strokeWidth={strokeWidth} strokeLinecap="round" />

          {/* Fill */}
          <path d={arcPath} fill="none" stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={halfCircumference} strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1.2s ease-in-out" }} />

          {/* Tick marks */}
          <line x1={startX} y1={cy + 8} x2={startX} y2={cy + 16} stroke="var(--card-border)" strokeWidth="2" />
          <line x1={cx} y1={cy - radius - 8} x2={cx} y2={cy - radius - 16} stroke="var(--card-border)" strokeWidth="2" />
          <line x1={endX} y1={cy + 8} x2={endX} y2={cy + 16} stroke="var(--card-border)" strokeWidth="2" />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-foreground text-glow">
              {percentage}%
            </span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-accent ml-1">
              <path d="M10 15V5M10 5l4 4M10 5L6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
