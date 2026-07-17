import { CalendarClock, Target } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { closeSummary, closeMeta } from "@/data/close-checklist";

export type FilterKey = "all" | "needs_review" | "auto_completed" | "in_progress";

const FILTERS: { key: FilterKey; label: string; count: number }[] = [
  { key: "all", label: "All", count: closeSummary.total },
  {
    key: "needs_review",
    label: "Needs Review",
    count: closeSummary.total - closeSummary.autoCompleted,
  },
  { key: "auto_completed", label: "Auto-Completed", count: closeSummary.autoCompleted },
  { key: "in_progress", label: "In Progress", count: closeSummary.inProgress },
];

export function CloseStatusBar({
  filter,
  onFilter,
}: {
  filter: FilterKey;
  onFilter: (f: FilterKey) => void;
}) {
  const pct = closeSummary.completionPct;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-semibold text-slate-100 sm:text-2xl">
              {closeMeta.periodLabel}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                Day {closeMeta.dayOfClose} of close
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Target className="h-4 w-4 text-slate-500" />
                Target: {closeMeta.targetDays}-day close
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                  closeMeta.onTrack
                    ? "bg-green-400/10 text-green-400"
                    : "bg-red-400/10 text-red-400"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", closeMeta.onTrack ? "bg-green-400" : "bg-red-400")} />
                {closeMeta.onTrack ? "On track" : "Behind"}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="w-full max-w-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-200">
                {closeSummary.autoCompleted}/{closeSummary.total} complete
              </span>
              <span className="font-heading text-lg font-semibold text-slate-100">{pct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full brand-gradient-surface" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-700/60 pt-4">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => onFilter(f.key)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-blue-400/40 bg-blue-400/10 text-blue-200"
                    : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-xs tabular-nums",
                    active ? "bg-blue-400/20 text-blue-100" : "bg-slate-700/60 text-slate-400"
                  )}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
