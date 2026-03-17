/**
 * components/metrics/EntryList.tsx
 *
 * Scrollable history table for submetric entries, sorted newest-first.
 * Theme-aware.
 */

import { formatDate } from "@/lib/utils";
import DeleteEntryButton from "@/components/metrics/DeleteEntryButton";
import type { SubmetricEntry } from "@/types";

interface EntryListProps {
  entries: SubmetricEntry[];
}

export default function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">No entries logged yet.</p>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
  );

  return (
    <div className="card-gradient rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-card-border text-muted-foreground text-left">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Note</th>
            <th className="px-4 py-3 w-12" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry) => (
            <tr key={entry.id}
              className="border-b border-card-border/50 last:border-0 hover:bg-foreground/[0.02] transition-colors">
              <td className="px-4 py-2.5 text-foreground/80">{formatDate(entry.recorded_at)}</td>
              <td className="px-4 py-2.5 font-medium text-foreground">{entry.value}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{entry.note ?? "\u2014"}</td>
              <td className="px-4 py-2.5"><DeleteEntryButton entryId={entry.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
