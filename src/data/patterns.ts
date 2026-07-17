/**
 * patterns.ts — spending patterns and anomalies derived from transactions.ts.
 * -------------------------------------------------------------------------
 * Groups every outflow by vendor + cadence, and computes the average amount,
 * a confidence score (the lowest confidence seen in the group, so a single
 * low-confidence occurrence surfaces as a badge), the last occurrence, and the
 * next projected date. Anomalies are pulled straight from the flagged
 * transactions so the copy always matches the ledger.
 */

import {
  transactions,
  type RecurrenceType,
  type TransactionCategory,
  type AnomalyType,
} from "@/data/transactions";

export interface SpendingPattern {
  id: string;
  vendor: string;
  category: TransactionCategory;
  cadence: RecurrenceType;
  avgAmount: number;
  occurrences: number;
  confidence: number; // lowest confidence observed in the group
  lastOccurrence: string; // ISO
  nextProjected: string | null; // ISO, null for one-time
  hasAnomaly: boolean;
}

const CADENCE_MONTHS: Record<RecurrenceType, number | null> = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
  "one-time": null,
};

function addMonthsISO(iso: string, months: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

// Group outflows by vendor + cadence + category.
const groups = new Map<
  string,
  {
    vendor: string;
    category: TransactionCategory;
    cadence: RecurrenceType;
    amounts: number[];
    confidences: number[];
    dates: string[];
    anomaly: boolean;
  }
>();

for (const t of transactions) {
  if (t.direction !== "outflow") continue;
  const key = `${t.counterparty}__${t.recurrence_type}__${t.category}`;
  const g = groups.get(key);
  if (g) {
    g.amounts.push(t.amount);
    g.confidences.push(t.confidence_score);
    g.dates.push(t.date);
    g.anomaly = g.anomaly || Boolean(t.anomaly);
  } else {
    groups.set(key, {
      vendor: t.counterparty,
      category: t.category,
      cadence: t.recurrence_type,
      amounts: [t.amount],
      confidences: [t.confidence_score],
      dates: [t.date],
      anomaly: Boolean(t.anomaly),
    });
  }
}

const CADENCE_ORDER: RecurrenceType[] = [
  "monthly",
  "quarterly",
  "annual",
  "one-time",
];

export const spendingPatterns: SpendingPattern[] = Array.from(groups.values())
  .map((g, i) => {
    const avgAmount =
      g.amounts.reduce((s, a) => s + a, 0) / g.amounts.length;
    const lastOccurrence = g.dates.slice().sort().at(-1)!;
    const months = CADENCE_MONTHS[g.cadence];
    return {
      id: `PAT-${String(i + 1).padStart(3, "0")}`,
      vendor: g.vendor,
      category: g.category,
      cadence: g.cadence,
      avgAmount: Math.round(avgAmount),
      occurrences: g.amounts.length,
      confidence: Math.min(...g.confidences),
      lastOccurrence,
      nextProjected: months ? addMonthsISO(lastOccurrence, months) : null,
      hasAnomaly: g.anomaly,
    };
  })
  .sort((a, b) => {
    const c = CADENCE_ORDER.indexOf(a.cadence) - CADENCE_ORDER.indexOf(b.cadence);
    return c !== 0 ? c : b.avgAmount - a.avgAmount;
  });

export interface PatternGroup {
  cadence: RecurrenceType;
  label: string;
  patterns: SpendingPattern[];
}

const CADENCE_LABELS: Record<RecurrenceType, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
  "one-time": "One-Time",
};

export const patternGroups: PatternGroup[] = CADENCE_ORDER.map((cadence) => ({
  cadence,
  label: CADENCE_LABELS[cadence],
  patterns: spendingPatterns.filter((p) => p.cadence === cadence),
})).filter((g) => g.patterns.length > 0);

/* ------------------------------------------------------------------ *
 * Flagged anomalies (surfaced above the pattern table)
 * ------------------------------------------------------------------ */

export interface PatternAnomaly {
  id: string;
  vendor: string;
  type: AnomalyType;
  headline: string;
  detail: string;
  date: string;
  confidence: number;
}

const ANOMALY_COPY: Record<AnomalyType, string> = {
  price_increase: "Price increase detected",
  double_charge: "Possible duplicate charge",
  late_invoice: "Late invoice — prior period",
};

export const patternAnomalies: PatternAnomaly[] = transactions
  .filter((t) => t.anomaly)
  .map((t) => ({
    id: t.id,
    vendor: t.counterparty,
    type: t.anomaly!,
    headline: ANOMALY_COPY[t.anomaly!],
    detail: t.note ?? ANOMALY_COPY[t.anomaly!],
    date: t.date,
    confidence: t.confidence_score,
  }));
