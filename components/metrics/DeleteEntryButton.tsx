/**
 * components/metrics/DeleteEntryButton.tsx
 *
 * Client Component button for deleting an entry.
 * Calls the deleteSubmetricEntry Server Action and refreshes the page.
 */

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSubmetricEntry } from "@/lib/actions";

interface DeleteEntryButtonProps {
  entryId: string;
}

export default function DeleteEntryButton({ entryId }: DeleteEntryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSubmetricEntry(entryId);
        router.refresh();
      } catch (err) {
        console.error("Failed to delete entry:", err);
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          Yes
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="text-xs text-gray-500 hover:text-gray-400"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      disabled={isPending}
      className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
      aria-label="Delete entry"
    >
      ✕
    </button>
  );
}
