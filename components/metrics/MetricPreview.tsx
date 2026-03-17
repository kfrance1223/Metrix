"use client";

import Link from "next/link";
import ProgressBar from "./ProgressBar";
import QuickLogInput from "./QuickLogInput";
import type { MetricWithScore } from "@/types";

interface MetricPreviewProps {
  metric: MetricWithScore | null;
  onEntryLogged?: () => void;
}

export default function MetricPreview({ metric, onEntryLogged }: MetricPreviewProps) {
  if (!metric) {
    return (
      <div className="score-gradient rounded-2xl p-6 flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground text-sm text-center">
          Expand a metric to preview it here
        </p>
      </div>
    );
  }

  const scorePercentage = Math.round(metric.score * 100);
  const radius = 50;
  const circumference = Math.PI * radius;
  const offset = circumference - metric.score * circumference;

  const handleEntryLogged = () => {
    onEntryLogged?.();
  };

  return (
    <div className="score-gradient rounded-2xl p-6">
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-36 h-24">
          <svg viewBox="0 0 120 70" className="w-full h-full">
            <path d="M 10 65 A 50 50 0 0 1 110 65" className="gauge-track" strokeWidth="8" />
            <path d="M 10 65 A 50 50 0 0 1 110 65" className="gauge-fill" strokeWidth="8"
              stroke={metric.color} strokeDasharray={`${circumference}`} strokeDashoffset={`${offset}`} />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="text-4xl font-bold text-glow" style={{ color: metric.color }}>
              {scorePercentage}%
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-center mb-4 uppercase tracking-wide" style={{ color: metric.color }}>
        {metric.name}
      </h3>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
          <p className="text-lg font-semibold text-foreground">{metric.weight}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Items</p>
          <p className="text-lg font-semibold text-foreground">{metric.submetrics.length}</p>
        </div>
      </div>

      {metric.submetrics.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          {metric.submetrics.map((sub) => {
            const subScore = Math.round(sub.score * 100);
            return (
              <div key={sub.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate mr-2">{sub.name}</span>
                  <span className="text-xs font-medium text-foreground/70 shrink-0">{subScore}%</span>
                </div>
                <ProgressBar value={sub.score} color={metric.color} className="h-1.5" />
                <QuickLogInput submetric={sub} color={metric.color} onEntryLogged={handleEntryLogged} />
              </div>
            );
          })}
        </div>
      )}

      <Link
        href={`/metrics/${metric.id}`}
        className="mt-5 block text-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Detailed log →
      </Link>
    </div>
  );
}
