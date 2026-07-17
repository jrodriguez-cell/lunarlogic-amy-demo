"use client";

import { useEffect, useState } from "react";
import { X, CircleCheck, Clock, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { statusMeta } from "@/components/close/status-icon";
import { cn, formatCurrency } from "@/lib/utils";
import {
  getTieOut,
  closeCategoryLabels,
  type CloseChecklistItem,
} from "@/data/close-checklist";
import {
  bankBalance,
  glBalance,
  outstandingChecks,
  depositsInTransit,
  bankFeesNotRecorded,
  tieOut,
  type ReconcilingItem,
} from "@/data/reconciliation";

const AUDIT_TRAIL = [
  { at: "2026-07-01 06:02", event: "Bank feed imported from First Meridian Bank" },
  { at: "2026-07-01 06:05", event: "Auto-matched 23 of 31 line items" },
  { at: "2026-07-01 06:05", event: "Flagged 8 items for review" },
  { at: "2026-07-03 09:14", event: "Prepared by Marcus Webb — pending approval" },
];

function ReconcilingRow({
  item,
  matched,
  approved,
  onApprove,
}: {
  item: ReconcilingItem;
  matched: boolean;
  approved: boolean;
  onApprove: () => void;
}) {
  const signed = item.kind === "deposit_in_transit" ? item.amount : -item.amount;
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">{item.description}</p>
        <p className="text-xs text-slate-500">
          {item.ref} · {item.date}
        </p>
      </div>
      <span className="shrink-0 font-heading text-sm font-semibold tabular-nums text-slate-200">
        {signed >= 0 ? "+" : "−"}
        {formatCurrency(Math.abs(item.amount))}
      </span>
      {matched ? (
        approved ? (
          <span className="inline-flex w-24 shrink-0 items-center justify-center gap-1 rounded border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] font-semibold uppercase text-green-400">
            <CircleCheck className="h-3 w-3" />
            Approved
          </span>
        ) : (
          <Button variant="outline" size="sm" className="h-7 w-24 shrink-0 px-2 text-xs" onClick={onApprove}>
            Approve
          </Button>
        )
      ) : (
        <span className="inline-flex w-24 shrink-0 items-center justify-center gap-1 rounded border border-amber-400/20 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase text-amber-400">
          <Clock className="h-3 w-3" />
          Unmatched
        </span>
      )}
    </div>
  );
}

function BankRecDetail() {
  // Outstanding checks + deposits in transit are matched (timing only);
  // the unrecorded bank fee is unmatched until booked to the GL.
  const matchedItems = [...outstandingChecks, ...depositsInTransit];
  const unmatchedItems = bankFeesNotRecorded;
  const [approved, setApproved] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-5">
      {/* GL vs bank balance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">GL balance</p>
          <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-slate-100">
            {formatCurrency(glBalance)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Bank balance</p>
          <p className="mt-1 font-heading text-lg font-semibold tabular-nums text-slate-100">
            {formatCurrency(bankBalance)}
          </p>
        </div>
      </div>

      {/* Reconciling items */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Reconciling items ({matchedItems.length + unmatchedItems.length})
        </p>
        <div className="overflow-hidden rounded-lg border border-slate-700 divide-y divide-slate-700/60">
          {matchedItems.map((it) => (
            <ReconcilingRow
              key={it.ref}
              item={it}
              matched
              approved={approved.has(it.ref)}
              onApprove={() =>
                setApproved((prev) => new Set(prev).add(it.ref))
              }
            />
          ))}
          {unmatchedItems.map((it) => (
            <ReconcilingRow key={it.ref} item={it} matched={false} approved={false} onApprove={() => {}} />
          ))}
        </div>
      </div>

      {/* Net difference */}
      <div className="flex items-center justify-between rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold text-slate-100">Net difference</span>
        </div>
        <span className="font-heading text-lg font-semibold tabular-nums text-green-400">
          {formatCurrency(tieOut.difference)}
        </span>
      </div>
      <p className="-mt-3 text-xs text-slate-500">
        Adjusted bank and adjusted book both tie to{" "}
        {formatCurrency(tieOut.adjustedBankBalance)} — fully reconciled.
      </p>

      {/* Audit trail */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Audit trail</p>
        <ul className="space-y-2">
          {AUDIT_TRAIL.map((e) => (
            <li key={e.at} className="flex gap-3 text-xs">
              <span className="shrink-0 tabular-nums text-slate-500">{e.at}</span>
              <span className="text-slate-400">{e.event}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GenericDetail({ item }: { item: CloseChecklistItem }) {
  const tie = getTieOut(item.id);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">GL</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
            {tie ? formatCurrency(tie.glAmount) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Supporting</p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-slate-100">
            {tie ? (tie.supportingAmount === null ? "Pending" : formatCurrency(tie.supportingAmount)) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Variance</p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold tabular-nums",
              tie && tie.isMaterial ? "text-amber-400" : "text-slate-100"
            )}
          >
            {tie && tie.variance !== null ? formatCurrency(tie.variance) : "—"}
          </p>
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Assigned to</span>
          <span className="text-slate-300">{item.assigned_to}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Completed</span>
          <span className="text-slate-300">
            {item.completion_timestamp
              ? new Date(item.completion_timestamp).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "—"}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
        <p className="text-sm leading-relaxed text-slate-400">{item.notes}</p>
      </div>
    </div>
  );
}

export function DetailPanel({
  item,
  onClose,
}: {
  item: CloseChecklistItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isBankRec = item.id === "CLS-01";
  const meta = statusMeta[item.status];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-slate-700 bg-slate-900 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-700 px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", meta.bg, meta.color)}>
                {meta.label}
              </span>
              <span className="text-xs text-slate-500">{closeCategoryLabels[item.category]}</span>
            </div>
            <h3 className="mt-1.5 font-heading text-lg font-semibold text-slate-100">{item.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isBankRec ? <BankRecDetail /> : <GenericDetail item={item} />}
        </div>
      </aside>
    </div>
  );
}
