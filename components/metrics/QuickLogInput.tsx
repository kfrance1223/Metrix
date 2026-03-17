"use client";

import { useState, useTransition } from "react";
import { createSubmetricEntry } from "@/lib/actions";
import type { SubmetricWithScore } from "@/types";

interface QuickLogInputProps {
  submetric: SubmetricWithScore;
  color: string;
  onEntryLogged: () => void;
}

export default function QuickLogInput({ submetric, color, onEntryLogged }: QuickLogInputProps) {
  const isBoolean = submetric.unit_type === "boolean";
  const stepSize = submetric.unit_type === "number" && submetric.target_value >= 10 ? 1 : 0.1;

  const [value, setValue] = useState(() => {
    if (isBoolean) {
      return submetric.currentPeriodValue > 0 ? 1 : 0;
    }
    return 0;
  });
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLog = () => {
    startTransition(async () => {
      try {
        await createSubmetricEntry({
          submetric_id: submetric.id,
          value,
          recorded_at: new Date().toISOString(),
        });
        setFeedback("success");
        setTimeout(() => setFeedback(null), 1200);
        onEntryLogged();
      } catch (e) {
        setFeedback("error");
        setErrorMsg(e instanceof Error ? e.message : "Failed to log");
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  const handleBooleanToggle = () => {
    const newVal = value === 1 ? 0 : 1;
    setValue(newVal);
    startTransition(async () => {
      try {
        await createSubmetricEntry({
          submetric_id: submetric.id,
          value: newVal,
          recorded_at: new Date().toISOString(),
        });
        setFeedback("success");
        setTimeout(() => setFeedback(null), 1200);
        onEntryLogged();
      } catch (e) {
        setFeedback("error");
        setErrorMsg(e instanceof Error ? e.message : "Failed to log");
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  if (isBoolean) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleBooleanToggle}
          disabled={isPending}
          className="relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0"
          style={{ backgroundColor: value === 1 ? color : "var(--surface)" }}
          aria-label={`Toggle ${submetric.name}`}
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
            style={{ transform: value === 1 ? "translateX(20px)" : "translateX(0)" }}
          />
        </button>
        {feedback === "success" && (
          <svg className="w-4 h-4 text-green-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        {feedback === "error" && (
          <span className="text-[10px] text-red-500">{errorMsg}</span>
        )}
      </div>
    );
  }

  const displayValue = Number.isInteger(stepSize) ? value : Math.round(value * 10) / 10;

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => setValue((v) => Math.max(0, Math.round((v - stepSize) * 10) / 10))}
        disabled={isPending}
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
          bg-surface hover:bg-border text-foreground/70 transition-colors cursor-pointer shrink-0"
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        value={displayValue}
        onChange={(e) => setValue(Math.max(0, parseFloat(e.target.value) || 0))}
        disabled={isPending}
        className="w-14 h-6 text-center text-xs font-medium rounded-md bg-surface border border-border
          text-foreground focus:outline-none focus:ring-1 focus:ring-accent [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        step={stepSize}
        min={0}
      />
      <button
        onClick={() => setValue((v) => Math.round((v + stepSize) * 10) / 10)}
        disabled={isPending}
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
          bg-surface hover:bg-border text-foreground/70 transition-colors cursor-pointer shrink-0"
        aria-label="Increase"
      >
        +
      </button>
      {submetric.unit_label && (
        <span className="text-[10px] text-muted-foreground shrink-0">{submetric.unit_label}</span>
      )}
      <button
        onClick={handleLog}
        disabled={isPending || value === 0}
        className="ml-auto h-6 px-2.5 rounded-md text-[10px] font-semibold uppercase tracking-wider
          transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-40"
        style={{
          backgroundColor: feedback === "success" ? "#22c55e" : color,
          color: "#000",
        }}
      >
        {isPending ? "…" : feedback === "success" ? "✓" : "Log"}
      </button>
      {feedback === "error" && (
        <span className="text-[10px] text-red-500 truncate max-w-[80px]">{errorMsg}</span>
      )}
    </div>
  );
}
