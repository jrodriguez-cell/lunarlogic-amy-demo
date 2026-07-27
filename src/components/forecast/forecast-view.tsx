"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { ForecastTab } from "@/components/forecast/forecast-tab";
import { ARCollectionTab } from "@/components/forecast/ar-collection-tab";
import { ExpenseSignalsTab } from "@/components/forecast/expense-signals-tab";
import { PatternsTab } from "@/components/forecast/patterns-tab";
import { AccuracyTab } from "@/components/forecast/accuracy-tab";

type TabKey = "forecast" | "ar" | "expenses" | "patterns" | "accuracy";

const TABS: { key: TabKey; label: string }[] = [
  { key: "forecast", label: "Forecast" },
  { key: "ar", label: "AR Collection" },
  { key: "expenses", label: "Expense Signals" },
  { key: "patterns", label: "Patterns" },
  { key: "accuracy", label: "Accuracy" },
];

export function ForecastView() {
  const [tab, setTab] = useState<TabKey>("forecast");

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Cash flow forecast views"
        className="inline-flex gap-1 rounded-lg border border-slate-700 bg-slate-800/40 p-1"
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-slate-700/70 text-slate-100"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "forecast" && <ForecastTab />}
      {tab === "ar" && <ARCollectionTab />}
      {tab === "expenses" && <ExpenseSignalsTab />}
      {tab === "patterns" && <PatternsTab />}
      {tab === "accuracy" && <AccuracyTab />}
    </div>
  );
}
