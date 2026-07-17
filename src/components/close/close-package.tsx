"use client";

import { useState } from "react";
import { FileText, Clock3, CircleCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusIcon, statusMeta } from "@/components/close/status-icon";
import {
  closeChecklist,
  closeCategories,
  closeCategoryLabels,
  closeSummary,
  closeMeta,
} from "@/data/close-checklist";

export function ClosePackage() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-slate-100">Close Package</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Assemble the signed close binder — all {closeSummary.total} items with support and sign-off.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-3 py-2">
              <Clock3 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-200">
                Est. time saved this month:{" "}
                <span className="font-semibold text-green-400">{closeMeta.timeSavedHours} hours</span>
              </span>
            </div>
            <Button variant="gradient" onClick={() => setOpen((o) => !o)} className="gap-2">
              <FileText className="h-4 w-4" />
              {open ? "Hide Preview" : "Generate Close Package"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/50 p-5">
            {/* Document header */}
            <div className="border-b border-slate-700 pb-4">
              <div className="flex items-center gap-2 text-blue-400">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Close Package · PDF preview</span>
              </div>
              <h3 className="mt-2 font-heading text-xl font-semibold text-slate-100">
                {closeMeta.periodLabel}
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
                <Meta label="Preparer" value={closeMeta.preparer} />
                <Meta label="Reviewer" value={closeMeta.reviewer} />
                <Meta label="Approver" value={closeMeta.approver} />
                <Meta
                  label="Date completed"
                  value={new Date(`${closeMeta.dateCompleted}T00:00:00Z`).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  } as Intl.DateTimeFormatOptions)}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <CircleCheck className="h-3.5 w-3.5 text-green-400" />
                {closeSummary.autoCompleted} of {closeSummary.total} items complete ·{" "}
                {closeSummary.total - closeSummary.autoCompleted} pending final review
              </div>
            </div>

            {/* Table of contents */}
            <div className="pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Table of contents
              </p>
              <div className="space-y-4">
                {closeCategories.map((cat, ci) => {
                  const items = closeChecklist.filter((i) => i.category === cat);
                  return (
                    <div key={cat}>
                      <p className="mb-1.5 text-sm font-semibold text-slate-300">
                        {ci + 1}. {closeCategoryLabels[cat]}
                      </p>
                      <ul className="space-y-1 pl-4">
                        {items.map((item) => (
                          <li key={item.id} className="flex items-center gap-2 text-sm">
                            <StatusIcon status={item.status} className="h-3.5 w-3.5" />
                            <span className="flex-1 truncate text-slate-400">{item.name}</span>
                            <span className={`shrink-0 text-xs ${statusMeta[item.status].color}`}>
                              {statusMeta[item.status].label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-slate-200">{value}</p>
    </div>
  );
}
