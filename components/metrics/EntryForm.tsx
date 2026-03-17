/**
 * components/metrics/EntryForm.tsx
 *
 * Form to log a new data point for a submetric on the metric detail page.
 * Theme-aware.
 */
"use client";

import { useState, type FormEvent } from "react";
import { createSubmetricEntry } from "@/lib/actions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { Submetric } from "@/types";

interface EntryFormProps {
  submetrics: Submetric[];
  onSubmit: () => void;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

const selectClasses =
  "bg-input border border-input-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all duration-200";

export default function EntryForm({ submetrics, onSubmit }: EntryFormProps) {
  const [selectedSubmetricId, setSelectedSubmetricId] = useState(
    submetrics.length > 0 ? submetrics[0].id : ""
  );
  const [value, setValue] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedSubmetric = submetrics.find((s) => s.id === selectedSubmetricId);
  const isBoolean = selectedSubmetric?.unit_type === "boolean";
  const isBooleanChecked = value === "1";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const finalValue = isBoolean ? (isBooleanChecked ? 1 : 0) : parseFloat(value);
      await createSubmetricEntry({
        submetric_id: selectedSubmetricId,
        value: finalValue,
        recorded_at: new Date(date).toISOString(),
        note: note || undefined,
      });
      setValue("");
      setDate(todayISO());
      setNote("");
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
    } finally {
      setLoading(false);
    }
  };

  if (submetrics.length === 0) {
    return (
      <div className="card-gradient rounded-2xl p-4">
        <p className="text-sm text-muted-foreground">No items to log. Add one first!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-gradient rounded-2xl p-5 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground/80">Log Entry</h3>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Item</span>
        <select value={selectedSubmetricId}
          onChange={(e) => { setSelectedSubmetricId(e.target.value); setValue(""); }}
          className={selectClasses}>
          {submetrics.map((sub) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>
      </label>

      {isBoolean ? (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isBooleanChecked}
            onChange={(e) => setValue(e.target.checked ? "1" : "0")}
            className="w-4 h-4 rounded bg-input border border-input-border text-accent focus:outline-none focus:ring-1 focus:ring-accent/20" />
          <span className="text-sm text-muted-foreground">Done today?</span>
        </label>
      ) : (
        <div className="flex gap-3 items-end">
          <Input label={`Value${selectedSubmetric?.unit_label ? ` (${selectedSubmetric.unit_label})` : ""}`}
            type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      )}

      {isBoolean && (
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      )}

      <Input label="Note (optional)" placeholder="e.g., morning session"
        value={note} onChange={(e) => setNote(e.target.value)} />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <Button variant="primary" type="submit" className="self-end"
        disabled={loading || (isBoolean ? false : !value)}>
        {loading ? "Logging..." : "Log"}
      </Button>
    </form>
  );
}
