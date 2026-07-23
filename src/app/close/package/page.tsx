import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PrintButton } from "@/components/close/print-button";
import {
  closeChecklist,
  closeCategories,
  closeCategoryLabels,
  closeSummary,
  closeMeta,
  getTieOut,
  getSupportingDocs,
  getSourceRef,
  getItemAuditTrail,
} from "@/data/close-checklist";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Close Package — June 2026 · Vanguard Digital LLC" };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" });
const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

const STATUS_TEXT: Record<string, string> = {
  auto_completed: "Auto-completed",
  needs_review: "Needs review",
  in_progress: "In progress",
  not_started: "Not started",
};

export default function ClosePackagePage() {
  return (
    <div className="min-h-screen bg-slate-950 py-8 print:bg-white print:py-0">
      {/* Toolbar (screen only) */}
      <div className="mx-auto mb-4 flex max-w-[8.5in] items-center justify-between px-2 print:hidden">
        <Link href="/close" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-4 w-4" /> Back to Close Workbook
        </Link>
        <PrintButton />
      </div>

      {/* The paper document */}
      <article className="mx-auto max-w-[8.5in] bg-white px-[0.85in] py-[0.7in] text-slate-900 shadow-xl print:max-w-none print:px-0 print:py-0 print:shadow-none">
        {/* Cover */}
        <header className="border-b-2 border-slate-800 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">LunarLogic · Close Package</p>
              <h1 className="mt-1 font-serif text-3xl font-bold text-slate-900">{closeMeta.periodLabel}</h1>
              <p className="mt-1 text-sm text-slate-600">{closeMeta.entity}</p>
            </div>
            <div className="rounded border border-green-600 bg-green-50 px-3 py-2 text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-green-700">Locked · {closeMeta.version}</p>
              <p className="mt-0.5 text-[11px] text-slate-600">{fmtDateTime(closeMeta.lockedAt)}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
            <Meta label="Preparer" value={closeMeta.preparer} />
            <Meta label="Reviewer" value={closeMeta.reviewer} />
            <Meta label="Approver" value={closeMeta.approver} />
            <Meta label="Date completed" value={fmtDate(`${closeMeta.dateCompleted}T00:00:00Z`)} />
            <Meta label="Package ID" value={closeMeta.packageId} />
            <Meta label="Content hash" value={closeMeta.contentHash} />
            <Meta label="Items" value={`${closeSummary.total} total · ${closeSummary.autoCompleted} auto-completed`} />
            <Meta label="Materiality" value="$1,000" />
          </div>
        </header>

        {/* Sections by category */}
        {closeCategories.map((cat, ci) => {
          const items = closeChecklist.filter((i) => i.category === cat);
          return (
            <section key={cat} className={ci === 0 ? "mt-6" : "mt-6 print:break-before-page"}>
              <h2 className="border-b border-slate-300 pb-1 font-serif text-lg font-bold text-slate-900">
                {ci + 1}. {closeCategoryLabels[cat]}
              </h2>
              <div className="mt-3 space-y-4">
                {items.map((item) => {
                  const tie = getTieOut(item.id);
                  const docs = getSupportingDocs(item);
                  const trail = getItemAuditTrail(item);
                  return (
                    <div key={item.id} className="break-inside-avoid rounded border border-slate-300 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400">{item.id}</p>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                        </div>
                        <span className="shrink-0 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {STATUS_TEXT[item.status]}
                        </span>
                      </div>

                      {tie && (
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                          <span className="text-slate-500">GL: <span className="font-semibold text-slate-800 tabular-nums">{formatCurrency(tie.glAmount)}</span></span>
                          <span className="text-slate-500">Supporting: <span className="font-semibold text-slate-800 tabular-nums">{tie.supportingAmount === null ? "Pending" : formatCurrency(tie.supportingAmount)}</span></span>
                          {tie.variance !== null && (
                            <span className="text-slate-500">Variance: <span className={`font-semibold tabular-nums ${tie.isMaterial ? "text-amber-700" : "text-slate-800"}`}>{formatCurrency(tie.variance)}</span></span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Supporting documentation</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">Trace to source: <span className="font-medium text-slate-700">{getSourceRef(item)}</span></p>
                          <ul className="mt-1 space-y-0.5 text-[12px] text-slate-700">
                            {docs.map((d) => (
                              <li key={d.label} className="flex justify-between gap-2">
                                <span>• {d.label}</span>
                                <span className="shrink-0 text-slate-400">{d.source}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Audit trail</p>
                          <ul className="mt-1 space-y-1 text-[12px] text-slate-700">
                            {trail.map((e, i) => (
                              <li key={i}>
                                <span className="tabular-nums text-slate-400">{fmtDateTime(e.ts)}</span> — {e.event}{" "}
                                <span className="text-slate-400">({e.actor})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <footer className="mt-8 border-t border-slate-300 pt-3 text-[11px] text-slate-500">
          Generated by LunarLogic · {closeMeta.packageId} · {closeMeta.contentHash} · This package is a period-locked
          snapshot; every figure ties to source in QuickBooks. Confidential.
        </footer>
      </article>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-slate-800">{value}</p>
    </div>
  );
}
