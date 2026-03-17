/**
 * components/metrics/SubmetricForm.tsx
 *
 * Form to create a new submetric within a parent metric.
 */
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createSubmetric } from "@/lib/actions";
import type { UnitType, TrackingPeriod, AggregationType } from "@/types";

interface SubmetricFormProps {
  metricId: string;
  onClose: () => void;
  onSubmit: () => void;
}

const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: "number", label: "Number (generic)" },
  { value: "time", label: "Time (hours)" },
  { value: "currency", label: "Currency ($)" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "boolean", label: "Yes / No (habit)" },
];

const TRACKING_PERIODS: { value: TrackingPeriod; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

const AGGREGATION_TYPES: { value: AggregationType; label: string }[] = [
  { value: "sum", label: "Add up values" },
  { value: "latest", label: "Use most recent" },
];

const inputClasses =
  "bg-input border border-input-border rounded-xl px-3 py-2 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all duration-200";

export default function SubmetricForm({
  metricId,
  onClose,
  onSubmit,
}: SubmetricFormProps) {
  const [name, setName] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("number");
  const [unitLabel, setUnitLabel] = useState("");
  const [targetValue, setTargetValue] = useState("1");
  const [trackingPeriod, setTrackingPeriod] = useState<TrackingPeriod>("daily");
  const [aggregationType, setAggregationType] =
    useState<AggregationType>("sum");
  const [weight, setWeight] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (unitType === "boolean") {
      setTargetValue("1");
      setAggregationType("latest");
      setUnitLabel("");
    }
  }, [unitType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createSubmetric({
        metric_id: metricId,
        name,
        unit_type: unitType,
        unit_label: unitLabel || null,
        target_value: parseFloat(targetValue),
        tracking_period: trackingPeriod,
        aggregation_type: aggregationType,
        weight: parseInt(weight, 10),
      });
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create submetric");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold text-foreground mb-4">Add Tracked Item</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Name */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Gym Hours" required className={inputClasses} />
        </label>

        {/* Unit Type */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Type</span>
          <select value={unitType} onChange={(e) => setUnitType(e.target.value as UnitType)}
            className={inputClasses}>
            {UNIT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        {/* Unit Label */}
        {unitType !== "boolean" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Unit Label</span>
            <input type="text" value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)}
              placeholder="e.g., hrs, kcal, $" className={inputClasses} />
          </label>
        )}

        {/* Target Value */}
        {unitType !== "boolean" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Target per Period</span>
            <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)}
              placeholder="1" step="any" required className={inputClasses} />
          </label>
        )}

        {/* Tracking Period */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Track by</span>
          <select value={trackingPeriod} onChange={(e) => setTrackingPeriod(e.target.value as TrackingPeriod)}
            className={inputClasses}>
            {TRACKING_PERIODS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>

        {/* Aggregation Type */}
        {unitType !== "boolean" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">How to combine entries</span>
            <select value={aggregationType} onChange={(e) => setAggregationType(e.target.value as AggregationType)}
              className={inputClasses}>
              {AGGREGATION_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground/60 mt-1">
              {aggregationType === "sum"
                ? "Add all values (for habits, distances, etc.)"
                : "Use the most recent value (for measurements)"}
            </p>
          </label>
        )}

        {/* Weight */}
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Importance (0-100)</span>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
            placeholder="100" min="0" max="100" className={inputClasses} />
          <p className="text-xs text-muted-foreground/60">
            All items&apos; weights should sum to 100 within this category
          </p>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={onClose}
            className="flex-1 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-foreground/5 cursor-pointer transition-all duration-200">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-linear-to-r from-accent to-accent-light hover:brightness-110 text-black rounded-xl py-2 text-sm font-medium cursor-pointer transition-all duration-200 disabled:opacity-50">
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
