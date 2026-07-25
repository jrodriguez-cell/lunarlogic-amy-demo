import { Fragment } from "react";
import { TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatCompactCurrency } from "@/lib/utils";
import {
  expenseWeeks,
  expenseAnomalies,
  windowLabel,
  windowTotal,
} from "@/data/expense-signals";
import type { RecurrenceType } from "@/data/transactions";

function RecurrenceBadge({ type, label }: { type: RecurrenceType; label: string }) {
  const tone =
    type === "one-time"
      ? "border-slate-600/60 bg-slate-700/30 text-slate-400"
      : type === "monthly"
        ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
        : type === "quarterly"
          ? "border-indigo-400/20 bg-indigo-400/10 text-indigo-300"
          : "border-violet-400/20 bg-violet-400/10 text-violet-300";
  return (
    <span className={cn("inline-block whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-semibold", tone)}>
      {label}
    </span>
  );
}

export function ExpenseSignalsTab() {
  return (
    <div className="space-y-6">
      {/* Concept label + window summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
          Illustrative concept — demo data
        </span>
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200 tabular-nums">{formatCurrency(windowTotal)}</span>{" "}
          in tracked spend · {windowLabel}
        </div>
      </div>

      {/* Flagged anomalies */}
      <div>
        <h3 className="mb-3 font-heading text-base font-semibold text-slate-200">
          Flagged for Review
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {expenseAnomalies.map((a) => (
            <Card key={a.id} className="border-amber-400/20 bg-amber-400/[0.04] p-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="h-4 w-4 shrink-0 text-amber-400" />
                <span className="text-sm font-semibold text-slate-100">{a.vendor}</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-amber-300">{a.headline}</p>
              <p className="mt-1.5 text-xs leading-snug text-slate-400">{a.detail}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly breakdown */}
      <div>
        <h3 className="mb-3 font-heading text-base font-semibold text-slate-200">
          Weekly Expense Breakdown — {windowLabel}
        </h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Recurrence</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenseWeeks.map((week) => (
                  <Fragment key={week.weekStart}>
                    <tr className="bg-slate-800/40">
                      <td colSpan={3} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Week of {week.weekLabel}
                        <span className="ml-2 font-normal text-slate-600">
                          {week.items.length} {week.items.length === 1 ? "item" : "items"}
                          {week.flaggedCount > 0 && (
                            <span className="ml-2 text-amber-400/80">· {week.flaggedCount} flagged</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide tabular-nums text-slate-300">
                        {formatCompactCurrency(week.total)}
                      </td>
                    </tr>
                    {week.items.map((it) => (
                      <tr
                        key={it.id}
                        className={cn(
                          "border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30",
                          it.flagged && "bg-amber-400/[0.04]"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-100">{it.vendor}</span>
                            {it.flagged && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                                <TriangleAlert className="h-3 w-3" />
                                Flagged
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{it.categoryLabel}</td>
                        <td className="px-4 py-3">
                          <RecurrenceBadge type={it.recurrence} label={it.recurrenceLabel} />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-200">
                          {formatCurrency(it.amount)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="mt-2 text-[11px] text-slate-600">
          Recurrence and flags are illustrative pattern-detection output over demo ledger data — no live
          QuickBooks connection or detection model is wired up.
        </p>
      </div>
    </div>
  );
}
