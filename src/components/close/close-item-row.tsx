import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusIcon } from "@/components/close/status-icon";
import { cn, formatCurrency } from "@/lib/utils";
import { getTieOut, type CloseChecklistItem } from "@/data/close-checklist";

export function CloseItemRow({
  item,
  highlighted,
  onViewDetail,
}: {
  item: CloseChecklistItem;
  highlighted?: boolean;
  onViewDetail: (item: CloseChecklistItem) => void;
}) {
  const tie = getTieOut(item.id);

  return (
    <div
      id={`item-${item.id}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        highlighted ? "bg-blue-400/10 ring-1 ring-inset ring-blue-400/30" : "hover:bg-slate-800/30"
      )}
    >
      <StatusIcon status={item.status} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">{item.name}</p>
        {item.flagReason && (
          <p className="mt-0.5 truncate text-xs text-slate-500">{item.flagReason}</p>
        )}
      </div>

      {/* GL vs supporting */}
      <div className="hidden w-56 shrink-0 items-center justify-end gap-4 text-right sm:flex">
        {tie ? (
          <>
            <div className="w-24">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">GL</p>
              <p className="text-xs font-semibold tabular-nums text-slate-300">
                {formatCurrency(tie.glAmount)}
              </p>
            </div>
            <div className="w-24">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Supporting</p>
              <p className="text-xs font-semibold tabular-nums text-slate-300">
                {tie.supportingAmount === null ? "Pending" : formatCurrency(tie.supportingAmount)}
              </p>
            </div>
          </>
        ) : (
          <span className="text-xs text-slate-600">—</span>
        )}
      </div>

      {/* Variance */}
      <div className="hidden w-24 shrink-0 text-right md:block">
        {tie && tie.variance !== null ? (
          tie.variance === 0 ? (
            <span className="text-xs font-medium text-slate-500">$0.00</span>
          ) : (
            <span
              className={cn(
                "inline-block rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                tie.isMaterial
                  ? "bg-amber-400/10 text-amber-400"
                  : "text-slate-400"
              )}
            >
              {tie.variance > 0 ? "+" : "−"}
              {formatCurrency(Math.abs(tie.variance))}
            </span>
          )
        ) : (
          <span className="text-xs text-slate-600">—</span>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-8 shrink-0 gap-1 px-2.5"
        onClick={() => onViewDetail(item)}
      >
        <span className="hidden sm:inline">View Detail</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
