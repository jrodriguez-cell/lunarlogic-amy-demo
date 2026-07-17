"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { SpendingPattern } from "@/data/patterns";
import type { RecurrenceType } from "@/data/transactions";

const CADENCES: RecurrenceType[] = ["monthly", "quarterly", "annual", "one-time"];
const CADENCE_LABELS: Record<RecurrenceType, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  "one-time": "One-Time",
};

export interface Override {
  cadence: RecurrenceType;
  amount: number;
}

export function OverrideModal({
  pattern,
  current,
  onClose,
  onSave,
}: {
  pattern: SpendingPattern;
  current?: Override;
  onClose: () => void;
  onSave: (id: string, next: Override) => void;
}) {
  const [cadence, setCadence] = useState<RecurrenceType>(current?.cadence ?? pattern.cadence);
  const [amount, setAmount] = useState<string>(String(current?.amount ?? pattern.avgAmount));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    const parsed = Number(amount.replace(/[^0-9.]/g, ""));
    onSave(pattern.id, {
      cadence,
      amount: Number.isFinite(parsed) ? Math.round(parsed) : pattern.avgAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Override ${pattern.vendor}`}
        className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="font-heading text-lg font-semibold text-slate-100">Override pattern</h3>
        <p className="mt-0.5 text-sm text-slate-400">{pattern.vendor}</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Cadence
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CADENCES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCadence(c)}
                  className={
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors " +
                    (cadence === c
                      ? "border-blue-400 bg-blue-400/10 text-blue-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200")
                  }
                >
                  {CADENCE_LABELS[c]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="override-amount"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Expected amount
            </label>
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-900/60 px-3 focus-within:border-blue-400">
              <span className="text-slate-500">$</span>
              <input
                id="override-amount"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent px-2 py-2 text-sm text-slate-100 outline-none tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={save}>
            Save override
          </Button>
        </div>
      </div>
    </div>
  );
}
