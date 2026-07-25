/**
 * expense-signals.ts — ILLUSTRATIVE CONCEPT DATA (not wired to QuickBooks).
 * -------------------------------------------------------------------------
 * A visual concept for weekly expense-pattern detection and alerting. Built
 * from the same demo ledger (transactions.ts), grouped into ISO weeks over a
 * recent window so the "weekly breakdown + recurrence + anomaly flag" idea
 * reads clearly in a walkthrough. No real detection model is connected.
 */

import {
  transactions,
  transactionCategoryLabels,
  type RecurrenceType,
  type TransactionCategory,
} from "@/data/transactions";
import { patternAnomalies, type PatternAnomaly } from "@/data/patterns";

/** Recurrence badge copy. */
export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  monthly: "Recurring — Monthly",
  quarterly: "Recurring — Quarterly",
  annual: "Recurring — Annual",
  "one-time": "One-off",
};

/** Display window for the weekly breakdown (inclusive ISO dates). */
export const windowStart = "2026-05-01";
export const windowEnd = "2026-05-31";
export const windowLabel = "May 2026";

function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = d.getUTCDay();
  const delta = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekLabel(weekStart: string): string {
  const end = addDaysISO(weekStart, 6);
  const fmt = (iso: string, withMonth: boolean) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
      month: withMonth ? "short" : undefined,
      day: "numeric",
      timeZone: "UTC",
    });
  const sameMonth = weekStart.slice(5, 7) === end.slice(5, 7);
  return `${fmt(weekStart, true)} – ${fmt(end, !sameMonth)}`;
}

export interface ExpenseLine {
  id: string;
  vendor: string;
  category: TransactionCategory;
  categoryLabel: string;
  amount: number;
  recurrence: RecurrenceType;
  recurrenceLabel: string;
  flagged: boolean;
  note?: string;
}

export interface ExpenseWeek {
  weekStart: string;
  weekLabel: string;
  total: number;
  flaggedCount: number;
  items: ExpenseLine[];
}

// Outflows in the display window, grouped into ISO weeks.
const weekMap = new Map<string, ExpenseLine[]>();

for (const t of transactions) {
  if (t.direction !== "outflow") continue;
  if (t.date < windowStart || t.date > windowEnd) continue;
  const wk = mondayOf(t.date);
  const line: ExpenseLine = {
    id: t.id,
    vendor: t.counterparty,
    category: t.category,
    categoryLabel: transactionCategoryLabels[t.category],
    amount: t.amount,
    recurrence: t.recurrence_type,
    recurrenceLabel: RECURRENCE_LABELS[t.recurrence_type],
    flagged: Boolean(t.anomaly),
    note: t.note,
  };
  const bucket = weekMap.get(wk);
  if (bucket) bucket.push(line);
  else weekMap.set(wk, [line]);
}

export const expenseWeeks: ExpenseWeek[] = Array.from(weekMap.entries())
  .sort(([a], [b]) => (a < b ? -1 : 1))
  .map(([weekStart, items]) => {
    items.sort((a, b) => b.amount - a.amount);
    return {
      weekStart,
      weekLabel: weekLabel(weekStart),
      total: items.reduce((s, i) => s + i.amount, 0),
      flaggedCount: items.filter((i) => i.flagged).length,
      items,
    };
  });

export const windowTotal = expenseWeeks.reduce((s, w) => s + w.total, 0);

/** Category rollup across the window (largest first) — for a compact summary. */
export interface CategoryTotal {
  category: TransactionCategory;
  label: string;
  amount: number;
}

const catMap = new Map<TransactionCategory, number>();
for (const w of expenseWeeks) {
  for (const it of w.items) {
    catMap.set(it.category, (catMap.get(it.category) ?? 0) + it.amount);
  }
}
export const categoryTotals: CategoryTotal[] = Array.from(catMap.entries())
  .map(([category, amount]) => ({ category, label: transactionCategoryLabels[category], amount }))
  .sort((a, b) => b.amount - a.amount);

/**
 * Flagged anomalies surfaced above the weekly breakdown. Reuses the same
 * planted anomalies as the Patterns tab so the alerting concept stays
 * consistent with the ledger (Adobe price jump, AWS duplicate, late invoice).
 */
export const expenseAnomalies: PatternAnomaly[] = patternAnomalies;
