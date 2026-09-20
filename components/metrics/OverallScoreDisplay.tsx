/**
 * components/metrics/OverallScoreDisplay.tsx
 *
 * Hero score display — a large semicircular gauge behind an
 * over-sized serif percentage. Sits inside the shrine glass panel.
 */

"use client";

interface OverallScoreDisplayProps {
  score: number; // 0.0 to 1.0
}

export default function OverallScoreDisplay({
  score,
}: OverallScoreDisplayProps) {
  const percentage = Math.round(score * 100);

  const cx = 170;
  const cy = 150;
  const radius = 120;
  const strokeWidth = 14;

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
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-[0.28em] mb-2">
        Overall Progress
      </span>
      <p className="text-sm text-muted-foreground/80 mb-8 font-display italic">
        A weighted read on the shape of your life.
      </p>

      <div className="relative" style={{ width: 340, height: 180 }}>
        <svg viewBox="0 0 340 180" className="w-full h-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="50%" stopColor="var(--accent-light)" />
              <stop offset="100%" stopColor="var(--accent-glow)" />
            </linearGradient>
          </defs>

          {/* Track */}
          <path
            d={arcPath}
            fill="none"
            stroke="var(--gauge-track)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.5"
          />

          {/* Fill */}
          <path
            d={arcPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />

          {/* Tick marks */}
          <line x1={startX} y1={cy + 10} x2={startX} y2={cy + 20} stroke="var(--card-border)" strokeWidth="1.5" opacity="0.6" />
          <line x1={cx} y1={cy - radius - 10} x2={cx} y2={cy - radius - 20} stroke="var(--card-border)" strokeWidth="1.5" opacity="0.6" />
          <line x1={endX} y1={cy + 10} x2={endX} y2={cy + 20} stroke="var(--card-border)" strokeWidth="1.5" opacity="0.6" />
        </svg>

        {/* Score numeral */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="flex items-start">
            <span
              className="font-display text-7xl font-semibold text-foreground leading-none text-glow"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {percentage}
            </span>
            <span className="font-display text-3xl text-accent leading-none mt-1 ml-1">
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
