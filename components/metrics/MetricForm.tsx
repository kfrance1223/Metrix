/**
 * components/metrics/MetricForm.tsx
 *
 * Modal form for creating a new metric (parent category).
 */
"use client";

import { useState, type FormEvent } from "react";
import { createMetric } from "@/lib/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const COLOR_OPTIONS = [
  "#f59e0b", // gold (accent)
  "#d97706", // amber
  "#92400e", // brown
  "#ef4444", // red
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
];

interface MetricFormProps {
  onClose: () => void;
  onSubmit: () => void;
}

export default function MetricForm({
  onClose,
  onSubmit,
}: MetricFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [weight, setWeight] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createMetric({
        name,
        color,
        weight: parseInt(weight, 10),
      });
      onSubmit();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create metric"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">New Category</h2>

      <Input
        label="Name"
        placeholder="e.g., Fitness"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Weight */}
      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Importance (0-100)</span>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          min="0"
          max="100"
          className="bg-input border border-input-border rounded-xl px-3 py-2 text-foreground
            focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all duration-200"
        />
        <p className="text-xs text-muted-foreground/60">
          All categories&apos; weights should sum to 100 for the overall score
        </p>
      </label>

      {/* Color palette */}
      <div>
        <label className="block text-sm text-muted-foreground mb-1">Color</label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-all duration-200 ${
                color === c
                  ? "border-white scale-110 shadow-lg"
                  : "border-transparent hover:border-white/30"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </form>
  );
}
