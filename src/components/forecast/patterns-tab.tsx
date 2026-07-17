"use client";

import { Fragment, useState } from "react";
import { TriangleAlert, Pencil, CircleCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverrideModal, type Override } from "@/components/forecast/override-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { patternGroups, patternAnomalies, type SpendingPattern } from "@/data/patterns";
import { transactionCategoryLabels } from "@/data/transactions";
import { cn, formatCurrency } from "@/lib/utils";

function ConfidenceBadge({ score }: { score: number }) {
  const tone =
    score > 0.9
      ? "bg-green-400/10 text-green-400 border-green-400/20"
      : score >= 0.7
        ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
        : "bg-red-400/10 text-red-400 border-red-400/20";
  return (
    <span className={cn("inline-block rounded border px-1.5 py-0.5 text-xs font-semibold tabular-nums", tone)}>
      {score.toFixed(2)}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const CADENCE_LABELS: Record<string, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  "one-time": "One-Time",
};

export function PatternsTab() {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [editing, setEditing] = useState<SpendingPattern | null>(null);

  return (
    <div className="space-y-6">
      {/* Flagged anomalies */}
      <div>
        <h3 className="mb-3 font-heading text-base font-semibold text-slate-200">
          Flagged Anomalies
        </h3>
        {patternAnomalies.length === 0 ? (
          <Card>
            <EmptyState
              title="No anomalies detected — spending looks normal"
              description="Every recurring pattern matched its expected cadence and amount."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {patternAnomalies.map((a) => (
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
        )}
      </div>

      {/* Pattern table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 text-right font-semibold">Avg amount</th>
                <th className="px-4 py-3 font-semibold">Confidence</th>
                <th className="px-4 py-3 font-semibold">Last</th>
                <th className="px-4 py-3 font-semibold">Next projected</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {patternGroups.map((group) => (
                <Fragment key={group.cadence}>
                  <tr className="bg-slate-800/40">
                    <td colSpan={7} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {group.label}
                      <span className="ml-2 font-normal text-slate-600">
                        {group.patterns.length} {group.patterns.length === 1 ? "pattern" : "patterns"}
                      </span>
                    </td>
                  </tr>
                  {group.patterns.map((p) => {
                    const ov = overrides[p.id];
                    const amount = ov?.amount ?? p.avgAmount;
                    const cadence = ov?.cadence ?? p.cadence;
                    return (
                      <tr key={p.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-100">{p.vendor}</span>
                            {ov && (
                              <span className="inline-flex items-center gap-1 rounded bg-blue-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                                <CircleCheck className="h-3 w-3" />
                                Overridden
                              </span>
                            )}
                          </div>
                          {cadence !== p.cadence && (
                            <span className="text-[11px] text-slate-500">
                              → {CADENCE_LABELS[cadence]}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {transactionCategoryLabels[p.category]}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-200">
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-4 py-3">
                          <ConfidenceBadge score={p.confidence} />
                        </td>
                        <td className="px-4 py-3 text-slate-400 tabular-nums">{fmtDate(p.lastOccurrence)}</td>
                        <td className="px-4 py-3 text-slate-400 tabular-nums">
                          {p.nextProjected ? fmtDate(p.nextProjected) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing(p)}
                            className="h-8 gap-1.5 px-2.5"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Override
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <OverrideModal
          pattern={editing}
          current={overrides[editing.id]}
          onClose={() => setEditing(null)}
          onSave={(id, next) => setOverrides((prev) => ({ ...prev, [id]: next }))}
        />
      )}
    </div>
  );
}
