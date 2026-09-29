/**
 * components/dashboard/DashboardHeader.tsx
 *
 * Time-of-day greeting, today's date, and the "+ Metric" quick action.
 * Greeting and date render in the viewer's local time zone, so they may
 * differ from the server render — hydration warnings are suppressed.
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import MetricForm from "@/components/metrics/MetricForm";

interface DashboardHeaderProps {
  name: string | null;
}

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader({ name }: DashboardHeaderProps) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1
          className="font-display text-4xl font-semibold text-foreground"
          suppressHydrationWarning
        >
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
          {dateLabel}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium cursor-pointer
          bg-linear-to-b from-accent to-accent-light hover:brightness-110
          text-black transition-all duration-200
          shadow-[0_8px_24px_-8px_var(--accent)]"
      >
        <Plus size={14} />
        Metric
      </button>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
        <MetricForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={() => {
            setIsFormOpen(false);
            router.refresh();
          }}
        />
      </Modal>
    </header>
  );
}
