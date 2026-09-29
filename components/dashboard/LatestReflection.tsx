/**
 * components/dashboard/LatestReflection.tsx
 *
 * Placeholder slot for the AI-generated daily reflection (post-V1).
 * Reserved in the layout now so the dashboard hierarchy is final.
 */

import { Sparkles } from "lucide-react";

export default function LatestReflection() {
  return (
    <section className="glass p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Latest Reflection
        </h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-accent border border-accent/30 rounded-full px-2 py-0.5">
          Coming soon
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
        <Sparkles size={22} className="text-accent" />
        <p className="text-sm text-foreground/85 max-w-xs">
          A daily summary of where you fell short and what to focus on next —
          generated from the data you track.
        </p>
      </div>
    </section>
  );
}
