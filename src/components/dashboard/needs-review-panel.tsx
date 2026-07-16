import Link from "next/link";
import { ChevronRight } from "lucide-react";

import {
  reviewItems,
  closeCategoryLabels,
  type CloseStatus,
} from "@/data/close-checklist";
import { formatCompactCurrency, cn } from "@/lib/utils";

const statusBadge: Record<
  Exclude<CloseStatus, "auto_completed">,
  { label: string; className: string }
> = {
  needs_review: { label: "Needs review", className: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  in_progress: { label: "In progress", className: "bg-blue-400/10 text-blue-300 border-blue-400/20" },
  not_started: { label: "Not started", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export function NeedsReviewPanel() {
  return (
    <ul className="divide-y divide-slate-700/60">
      {reviewItems.map((item) => {
        const badge = statusBadge[item.status as keyof typeof statusBadge];
        return (
          <li key={item.id}>
            <Link
              href={`/close-workbook?item=${item.id}`}
              className="group flex items-start gap-3 px-1 py-3 transition-colors hover:bg-slate-800/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                  <span className="rounded bg-slate-700/40 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                    {closeCategoryLabels[item.category]}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold text-slate-100">
                  {item.name}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {item.flagReason}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                {item.amount != null && (
                  <span className="font-heading text-sm font-semibold tabular-nums text-slate-200">
                    {formatCompactCurrency(item.amount)}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-slate-300" />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
