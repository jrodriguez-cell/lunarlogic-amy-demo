import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { cn, formatCurrency, formatCompactCurrency, formatSignedPct } from "@/lib/utils";

import { cashPosition } from "@/data/reconciliation";
import { projectedFourWeekNet } from "@/data/forecast";
import { closeSummary } from "@/data/close-checklist";
import { covenantHealth, type HealthLevel } from "@/data/covenants";

function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex h-full flex-col p-5">{children}</CardContent>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  );
}

const healthTone: Record<HealthLevel, { dot: string; text: string; label: string }> = {
  green: { dot: "bg-green-400", text: "text-green-400", label: "Healthy" },
  amber: { dot: "bg-amber-400", text: "text-amber-400", label: "Early warning" },
  red: { dot: "bg-red-400", text: "text-red-400", label: "Breach" },
};

export function StatCards() {
  const up = cashPosition.wowDelta >= 0;
  const net4Positive = projectedFourWeekNet >= 0;
  const health = healthTone[covenantHealth.level];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1 — Cash Position */}
      <StatCard>
        <Label>Cash Position</Label>
        <p className="mt-2 font-heading text-3xl font-semibold text-slate-100">
          {formatCurrency(cashPosition.current)}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-semibold",
              up ? "text-green-400" : "text-red-400"
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {formatCompactCurrency(cashPosition.wowDelta)} ({formatSignedPct(cashPosition.wowPct)})
          </span>
        </div>
        <p className="mt-auto pt-3 text-xs text-slate-500">vs. last week</p>
      </StatCard>

      {/* 2 — Projected 4-Week Net */}
      <StatCard>
        <Label>Projected 4-Week Net</Label>
        <p
          className={cn(
            "mt-2 font-heading text-3xl font-semibold",
            net4Positive ? "text-green-400" : "text-slate-100"
          )}
        >
          {net4Positive ? "+" : "−"}
          {formatCompactCurrency(Math.abs(projectedFourWeekNet))}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-semibold",
              net4Positive ? "text-green-400" : "text-amber-400"
            )}
          >
            {net4Positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            Net cash flow
          </span>
        </div>
        <p className="mt-auto pt-3 text-xs text-slate-500">
          Next 4 weeks · audit + tax draw in wk 2
        </p>
      </StatCard>

      {/* 3 — Close Progress */}
      <StatCard>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <Label>Close Progress</Label>
            <p className="mt-2 font-heading text-3xl font-semibold text-slate-100">
              {closeSummary.autoCompleted}
              <span className="text-xl text-slate-500">/{closeSummary.total}</span>
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-300">items complete</p>
          </div>
          <ProgressRing value={closeSummary.completionPct}>
            <span className="font-heading text-sm font-semibold text-slate-100">
              {closeSummary.completionPct}%
            </span>
          </ProgressRing>
        </div>
        <p className="mt-auto pt-3 text-xs text-slate-500">
          {closeSummary.total - closeSummary.autoCompleted} items need attention
        </p>
      </StatCard>

      {/* 4 — Covenant Health */}
      <StatCard>
        <div className="flex items-center justify-between">
          <Label>Covenant Health</Label>
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", health.text)}>
            <span className={cn("h-2.5 w-2.5 rounded-full", health.dot)} />
            {health.label}
          </span>
        </div>
        <p className="mt-2 font-heading text-3xl font-semibold text-slate-100">
          {covenantHealth.currentValue.toFixed(2)}
          {covenantHealth.unit}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-300">
          {covenantHealth.label}
        </p>
        <p className="mt-auto pt-3 text-xs text-slate-500">
          Floor {covenantHealth.operator} {covenantHealth.threshold.toFixed(1)}
          {covenantHealth.unit}
          {covenantHealth.breachValue != null
            ? ` · ${covenantHealth.breachValue.toFixed(1)}${covenantHealth.unit} projected ${covenantHealth.breachMonthShort}`
            : ""}
        </p>
      </StatCard>
    </div>
  );
}
