"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CloseStatusBar, type FilterKey } from "@/components/close/close-status-bar";
import { CategorySection } from "@/components/close/category-section";
import { DetailPanel } from "@/components/close/detail-panel";
import { ClosePackage } from "@/components/close/close-package";
import {
  closeChecklist,
  closeCategories,
  type CloseChecklistItem,
  type CloseCategory,
} from "@/data/close-checklist";

function matchesFilter(item: CloseChecklistItem, filter: FilterKey): boolean {
  switch (filter) {
    case "all":
      return true;
    case "needs_review":
      return item.status !== "auto_completed";
    case "auto_completed":
      return item.status === "auto_completed";
    case "in_progress":
      return item.status === "in_progress";
  }
}

export function CloseView() {
  const params = useSearchParams();
  const deepLinkId = params.get("item");

  const [filter, setFilter] = useState<FilterKey>("all");
  const [detailItem, setDetailItem] = useState<CloseChecklistItem | null>(null);
  const [expanded, setExpanded] = useState<Set<CloseCategory>>(
    () => new Set(closeCategories)
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Honor a ?item= deep link from the dashboard: expand its category, scroll to
  // and highlight it, and open the detail panel.
  useEffect(() => {
    if (!deepLinkId) return;
    const item = closeChecklist.find((i) => i.id === deepLinkId);
    if (!item) return;
    setFilter("all");
    setExpanded((prev) => new Set(prev).add(item.category));
    setHighlightId(item.id);
    setDetailItem(item);
    const t = setTimeout(() => {
      document.getElementById(`item-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    const clear = setTimeout(() => setHighlightId(null), 4000);
    return () => {
      clearTimeout(t);
      clearTimeout(clear);
    };
  }, [deepLinkId]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<CloseCategory, CloseChecklistItem[]>();
    for (const cat of closeCategories) {
      const items = closeChecklist.filter(
        (i) => i.category === cat && matchesFilter(i, filter)
      );
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [filter]);

  const toggle = (cat: CloseCategory) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });

  return (
    <div className="space-y-6">
      <CloseStatusBar filter={filter} onFilter={setFilter} />

      <div className="space-y-3">
        {closeCategories
          .filter((cat) => itemsByCategory.has(cat))
          .map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              items={itemsByCategory.get(cat)!}
              expanded={expanded.has(cat)}
              onToggle={() => toggle(cat)}
              highlightId={highlightId}
              onViewDetail={setDetailItem}
            />
          ))}
        {itemsByCategory.size === 0 && (
          <p className="rounded-xl border border-slate-700 bg-slate-800/40 px-4 py-10 text-center text-sm text-slate-500">
            No items match this filter.
          </p>
        )}
      </div>

      <ClosePackage />

      {detailItem && <DetailPanel item={detailItem} onClose={() => setDetailItem(null)} />}
    </div>
  );
}
