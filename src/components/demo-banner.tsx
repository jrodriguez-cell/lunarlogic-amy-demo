"use client";

import { X } from "lucide-react";

import { demoClient } from "@/data/client";

/**
 * Subtle blue-tinted banner marking this as a non-production demo.
 * Dismissal state is owned by AppShell (so the layout offset can react) and
 * persisted to localStorage there.
 */
export function DemoBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative flex h-[33px] w-full items-center justify-center border-b border-blue-400/20 bg-blue-400/10 px-10 text-center text-xs font-medium tracking-wide text-blue-200">
      <span className="truncate">
        {demoClient.environmentLabel} — {demoClient.name}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss demo banner"
        className="absolute right-2 rounded p-1 text-blue-300/80 transition-colors hover:bg-blue-400/10 hover:text-blue-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
