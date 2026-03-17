/**
 * components/metrics/MetricAccordion.tsx
 *
 * Expandable metric card for the /metrics management page.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateMetric, deleteMetric } from "@/lib/actions";
import SubmetricRow from "./SubmetricRow";
import SubmetricForm from "./SubmetricForm";
import type { MetricWithScore } from "@/types";

interface MetricAccordionProps {
  metric: MetricWithScore;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const COLOR_OPTIONS = [
  "#f59e0b", "#d97706", "#92400e", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
];

export default function MetricAccordion({
  metric,
  isExpanded,
  onToggle,
  onSelect,
}: MetricAccordionProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState(metric.name);
  const [color, setColor] = useState(metric.color);
  const [weight, setWeight] = useState(String(metric.weight));

  const inputClasses =
    "bg-input border border-input-border rounded-lg px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-accent/50 transition-all duration-200";

  const scorePercentage = Math.round(metric.score * 100);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateMetric(metric.id, { name, color, weight: parseInt(weight, 10) });
      setEditing(false);
      router.refresh();
    } catch { /* keep editing */ } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${metric.name}" and all its tracked items?`)) return;
    setDeleting(true);
    try {
      await deleteMetric(metric.id);
      router.refresh();
    } catch { setDeleting(false); }
  };

  const handleMutate = () => router.refresh();

  return (
    <div className="card-gradient rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => { onToggle(); onSelect(); }}
        className="w-full flex items-center justify-between p-5 cursor-pointer text-left transition-colors hover:bg-foreground/[0.02]"
      >
        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: metric.color }} />
          <h3 className="text-base font-bold text-foreground uppercase tracking-wide">{metric.name}</h3>
          <span className="text-xs text-muted-foreground">
            {metric.submetrics.length} item{metric.submetrics.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold" style={{ color: metric.color }}>{scorePercentage}%</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            className={`text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-card-border/30">
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-muted-foreground">Weight: {metric.weight}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(!editing)}
                className="text-xs text-muted-foreground hover:text-accent cursor-pointer transition-colors">
                {editing ? "Cancel" : "Edit"}
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="text-xs text-muted-foreground hover:text-red-400 cursor-pointer transition-colors disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>

          {/* Inline edit */}
          {editing && (
            <div className="bg-background rounded-xl p-3 mb-3 border border-card-border/50 flex flex-col gap-3">
              <div className="flex gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Metric name"
                  className={`${inputClasses} flex-1`} />
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                  min="0" max="100" className={`${inputClasses} w-20`} placeholder="Weight" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color:</span>
                {COLOR_OPTIONS.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                      color === c ? "border-white scale-110" : "border-transparent hover:border-white/30"
                    }`} style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={handleSave} disabled={loading}
                  className="text-xs bg-accent hover:bg-accent-light text-black px-3 py-1 rounded-lg cursor-pointer transition-colors disabled:opacity-50">
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* Submetric rows */}
          {metric.submetrics.length > 0 ? (
            <div className="flex flex-col gap-1 mb-3">
              {metric.submetrics.map((sub) => (
                <SubmetricRow key={sub.id} submetric={sub} onMutate={handleMutate} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 mb-3">No tracked items yet.</p>
          )}

          {/* Add submetric */}
          {showAddForm ? (
            <div className="bg-background rounded-xl p-3 border border-card-border/50">
              <SubmetricForm metricId={metric.id}
                onClose={() => setShowAddForm(false)}
                onSubmit={() => { setShowAddForm(false); handleMutate(); }} />
            </div>
          ) : (
            <button onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 text-xs text-accent/70 hover:text-accent cursor-pointer transition-colors">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 2v6M2 5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Add tracked item
            </button>
          )}
        </div>
      )}
    </div>
  );
}
