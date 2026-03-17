/**
 * components/metrics/ProgressBar.tsx
 *
 * Horizontal progress bar with theme-aware track and colored fill.
 */

interface ProgressBarProps {
  value: number; // 0.0 to 1.0
  color: string; // hex color for the fill
  className?: string;
}

export default function ProgressBar({
  value,
  color,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.round(
    Math.min(1, Math.max(0, value)) * 100
  );

  return (
    <div
      className={`w-full rounded-full h-2 overflow-hidden bg-surface ${className}`}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${percentage}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 8px ${color}40`,
        }}
      />
    </div>
  );
}
