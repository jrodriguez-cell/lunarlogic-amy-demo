import { FileText, Link2, ScrollText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SupportingDoc, AuditEvent, DocSource } from "@/data/close-checklist";

const sourceTone: Record<DocSource, string> = {
  QuickBooks: "bg-green-400/10 text-green-400 border-green-400/20",
  Plaid: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  Gusto: "bg-violet-400/10 text-violet-300 border-violet-400/20",
  Schedule: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  Document: "bg-slate-500/10 text-slate-300 border-slate-500/20",
};

export function SupportingDocs({ docs, sourceRef }: { docs: SupportingDoc[]; sourceRef?: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Supporting documentation
      </p>
      {sourceRef && (
        <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">
          <Link2 className="h-3.5 w-3.5 text-slate-500" />
          Trace to source: <span className="font-medium text-slate-300">{sourceRef}</span>
        </div>
      )}
      <ul className="space-y-1.5">
        {docs.map((d) => (
          <li key={d.label} className="flex items-center gap-2.5 rounded-lg border border-slate-700/70 bg-slate-800/40 px-3 py-2">
            <FileText className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{d.label}</span>
            {d.ref && <span className="shrink-0 text-[11px] text-slate-500 tabular-nums">{d.ref}</span>}
            <span className={cn("shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold", sourceTone[d.source])}>
              {d.source}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuditTrail({ events }: { events: AuditEvent[] }) {
  const fmt = (ts: string) =>
    new Date(ts).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <ScrollText className="h-3.5 w-3.5" /> Audit trail
      </p>
      <ol className="space-y-2.5">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {i < events.length - 1 && <span className="mt-0.5 w-px flex-1 bg-slate-700" />}
            </div>
            <div className="pb-0.5">
              <p className="text-[11px] tabular-nums text-slate-500">{fmt(e.ts)}</p>
              <p className="text-sm text-slate-300">{e.event}</p>
              <p className="text-[11px] text-slate-500">{e.actor}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
