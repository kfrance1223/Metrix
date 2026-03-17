/**
 * components/metrics/MetricsPageClient.tsx
 *
 * Client-side wrapper for the /metrics management page.
 * Two-column layout: metric accordion list (left) + preview panel (right).
 */
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MetricAccordion from "./MetricAccordion";
import MetricForm from "./MetricForm";
import MetricPreview from "./MetricPreview";
import Modal from "@/components/ui/Modal";
import type { MetricWithScore } from "@/types";

interface MetricsPageClientProps {
  metrics: MetricWithScore[];
}

export default function MetricsPageClient({ metrics }: MetricsPageClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedMetric = metrics.find((m) => m.id === selectedId) || null;

  const handleMetricCreated = () => {
    startTransition(() => {
      router.refresh();
      setModalOpen(false);
    });
  };

  const handleEntryLogged = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Metrics</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer
            bg-linear-to-r from-accent to-accent-light hover:brightness-110
            text-black transition-all duration-200 shadow-lg shadow-accent/15 hover:shadow-accent/25"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          New Category
        </button>
      </div>

      {metrics.length === 0 ? (
        <div className="score-gradient rounded-2xl flex flex-col items-center justify-center h-48">
          <p className="text-foreground/70 text-lg mb-2">No metrics yet</p>
          <p className="text-muted-foreground text-sm">
            Click &quot;New Category&quot; to start building your life metrics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-3">
            {metrics.map((metric) => (
              <MetricAccordion key={metric.id} metric={metric}
                isExpanded={expandedId === metric.id}
                onToggle={() => setExpandedId((prev) => (prev === metric.id ? null : metric.id))}
                onSelect={() => setSelectedId(metric.id)} />
            ))}
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <MetricPreview metric={selectedMetric} onEntryLogged={handleEntryLogged} />
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <MetricForm onClose={() => setModalOpen(false)} onSubmit={handleMetricCreated} />
      </Modal>
    </>
  );
}
