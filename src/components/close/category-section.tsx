import { ChevronDown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CloseItemRow } from "@/components/close/close-item-row";
import { IntercompanyDetail } from "@/components/close/intercompany-detail";
import { cn } from "@/lib/utils";
import {
  closeCategoryLabels,
  type CloseCategory,
  type CloseChecklistItem,
} from "@/data/close-checklist";

export function CategorySection({
  category,
  items,
  expanded,
  onToggle,
  highlightId,
  onViewDetail,
}: {
  category: CloseCategory;
  items: CloseChecklistItem[];
  expanded: boolean;
  onToggle: () => void;
  highlightId?: string | null;
  onViewDetail: (item: CloseChecklistItem) => void;
}) {
  const done = items.filter((i) => i.status === "auto_completed").length;

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-800/30"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-500 transition-transform",
            expanded ? "rotate-0" : "-rotate-90"
          )}
        />
        <span className="font-heading text-base font-semibold text-slate-100">
          {closeCategoryLabels[category]}
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span className="tabular-nums">
            {done}/{items.length} complete
          </span>
          {done < items.length && (
            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 font-semibold text-amber-400">
              {items.length - done} open
            </span>
          )}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-700/60 divide-y divide-slate-700/40">
          {items.map((item) => (
            <CloseItemRow
              key={item.id}
              item={item}
              highlighted={highlightId === item.id}
              onViewDetail={onViewDetail}
            />
          ))}
          {category === "intercompany" && <IntercompanyDetail />}
        </div>
      )}
    </Card>
  );
}
