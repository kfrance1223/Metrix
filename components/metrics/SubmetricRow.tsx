/**
 * components/metrics/SubmetricRow.tsx
 *
 * Single submetric row within a MetricAccordion.
 * Supports inline editing and deletion.
 */
"use client";

import { useState, type FormEvent } from "react";
import { updateSubmetric, deleteSubmetric } from "@/lib/actions";
import type { Submetric, UnitType, TrackingPeriod, AggregationType } from "@/types";

interface SubmetricRowProps {
  submetric: Submetric;
  onMutate: () => void;
}

const inputClasses =
  "bg-input border border-input-border rounded-lg px-2 py-1 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-all duration-200";

export default function SubmetricRow({ submetric, onMutate }: SubmetricRowProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(submetric.name);
  const [unitType, setUnitType] = useState<UnitType>(submetric.unit_type);
  const [unitLabel, setUnitLabel] = useState(submetric.unit_label || "");
  const [targetValue, setTargetValue] = useState(String(submetric.target_value));
  const [trackingPeriod, setTrackingPeriod] = useState<TrackingPeriod>(submetric.tracking_period);
  const [aggregationType, setAggregationType] = useState<AggregationType>(submetric.aggregation_type);
  const [weight, setWeight] = useState(String(submetric.weight));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSubmetric(submetric.id, {
        name,
        unit_type: unitType,
        unit_label: unitLabel || null,
        target_value: parseFloat(targetValue),
        tracking_period: trackingPeriod,
        aggregation_type: aggregationType,
        weight: parseInt(weight, 10),
      });
      setEditing(false);
      onMutate();
    } catch {
      // Keep edit mode open on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSubmetric(submetric.id);
      onMutate();
    } catch {
      setDeleting(false);
    }
  };

  const cancelEdit = () => {
    setName(submetric.name);
    setUnitType(submetric.unit_type);
    setUnitLabel(submetric.unit_label || "");
    setTargetValue(String(submetric.target_value));
    setTrackingPeriod(submetric.tracking_period);
    setAggregationType(submetric.aggregation_type);
    setWeight(String(submetric.weight));
    setEditing(false);
  };

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="bg-background rounded-xl p-3 flex flex-col gap-2 border border-card-border/50"
      >
        <div className="grid grid-cols-2 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className={inputClasses} />
          <select value={unitType} onChange={(e) => setUnitType(e.target.value as UnitType)} className={inputClasses}>
            <option value="number">Number</option>
            <option value="time">Time (hrs)</option>
            <option value="currency">Currency ($)</option>
            <option value="percentage">Percentage (%)</option>
            <option value="boolean">Yes / No</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {unitType !== "boolean" && (
            <>
              <input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="Unit label" className={inputClasses} />
              <input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="Target" step="any" required className={inputClasses} />
            </>
          )}
          <select value={trackingPeriod} onChange={(e) => setTrackingPeriod(e.target.value as TrackingPeriod)} className={inputClasses}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {unitType !== "boolean" && (
            <select value={aggregationType} onChange={(e) => setAggregationType(e.target.value as AggregationType)} className={inputClasses}>
              <option value="sum">Sum</option>
              <option value="latest">Latest</option>
            </select>
          )}
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight" min="0" max="100" className={inputClasses} />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button type="button" onClick={cancelEdit}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-1 rounded-lg cursor-pointer transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="text-xs bg-accent hover:bg-accent-light text-black px-3 py-1 rounded-lg cursor-pointer transition-colors disabled:opacity-50">
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-foreground/[0.03] group transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm text-foreground/90 truncate">{submetric.name}</span>
        <span className="text-xs text-muted-foreground">
          {submetric.unit_type === "boolean" ? "Yes/No" : `${submetric.target_value} ${submetric.unit_label || ""}`}
        </span>
        <span className="text-xs text-muted-foreground/60 capitalize">{submetric.tracking_period}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)}
          className="p-1.5 text-muted-foreground hover:text-accent cursor-pointer transition-colors" title="Edit">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 2l2 2-7 7H3v-2l7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="p-1.5 text-muted-foreground hover:text-red-400 cursor-pointer transition-colors disabled:opacity-50" title="Delete">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M6 7v3M8 7v3M4 4l.5 7a1 1 0 001 1h3a1 1 0 001-1L10 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
