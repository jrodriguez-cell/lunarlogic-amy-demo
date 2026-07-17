import { ArrowLeftRight, CircleCheck, Clock } from "lucide-react";

import {
  intercompanyItems,
  intercompanyElimination,
  intercompanyEliminationTotals,
} from "@/data/reconciliation";
import { cn, formatCurrency } from "@/lib/utils";

const ENTITY_LABEL: Record<string, string> = {
  digital_llc: "Vanguard Digital LLC",
  holdings_llc: "Vanguard Holdings LLC",
};

export function IntercompanyDetail() {
  const balanced =
    intercompanyEliminationTotals.debit === intercompanyEliminationTotals.credit;

  return (
    <div className="space-y-4 border-t border-slate-700/60 bg-slate-900/30 px-4 py-4">
      {/* Relationship header */}
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-slate-700 bg-slate-800/40 px-4 py-3 text-center">
        <span className="font-heading text-sm font-semibold text-slate-100">
          Vanguard Digital LLC
        </span>
        <ArrowLeftRight className="h-4 w-4 text-blue-400" />
        <span className="font-heading text-sm font-semibold text-slate-100">
          Vanguard Holdings LLC
        </span>
      </div>

      {/* Intercompany transactions */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Intercompany transactions
        </p>
        <div className="space-y-2">
          {intercompanyItems.map((ic) => {
            const matched = ic.status === "matched";
            return (
              <div
                key={ic.ref}
                className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2.5"
              >
                {matched ? (
                  <CircleCheck className="h-4 w-4 shrink-0 text-green-400" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100">{ic.description}</p>
                  <p className="text-xs text-slate-500">
                    {ENTITY_LABEL[ic.from]} → {ENTITY_LABEL[ic.to]} · {ic.frequency}
                    {ic.ref === "IC-MGMT-0630" && " · auto-accrued"}
                    {ic.ref === "IC-ALLOC-0630" && " · auto-calculated"}
                  </p>
                </div>
                <span className="shrink-0 font-heading text-sm font-semibold tabular-nums text-slate-200">
                  {formatCurrency(ic.amount)}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                    matched
                      ? "border-green-400/20 bg-green-400/10 text-green-400"
                      : "border-amber-400/20 bg-amber-400/10 text-amber-400"
                  )}
                >
                  {matched ? "Matched" : "Unmatched"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-built elimination JE */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Elimination entry · journal preview
        </p>
        <div className="overflow-hidden rounded-lg border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/40 text-[10px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2 text-left font-semibold">Account</th>
                <th className="px-3 py-2 text-right font-semibold">Debit</th>
                <th className="px-3 py-2 text-right font-semibold">Credit</th>
              </tr>
            </thead>
            <tbody>
              {intercompanyElimination.map((line, i) => (
                <tr key={i} className="border-b border-slate-700/50 last:border-0">
                  <td className="px-3 py-2 text-slate-300">
                    {line.account}
                    {line.provisional && (
                      <span className="ml-1.5 text-[10px] text-amber-400">provisional</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">
                    {line.debit ? formatCurrency(line.debit) : ""}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-300">
                    {line.credit ? formatCurrency(line.credit) : ""}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-800/40 font-semibold">
                <td className="px-3 py-2 text-slate-200">
                  {balanced ? "Balanced" : "Out of balance"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-100">
                  {formatCurrency(intercompanyEliminationTotals.debit)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-slate-100">
                  {formatCurrency(intercompanyEliminationTotals.credit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
