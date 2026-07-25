/**
 * ar-collection.ts — ILLUSTRATIVE CONCEPT DATA (not wired to QuickBooks).
 * -------------------------------------------------------------------------
 * A visual concept for per-customer AR collection forecasting. Every figure
 * here is mock/demo data, consistent with the client names used elsewhere in
 * the ledger (transactions.ts) but NOT a working prediction model.
 *
 * The "prediction" is a deliberately simple mock rule so the concept reads
 * clearly in a walkthrough:
 *
 *   predicted payment date = invoice date + the customer's typical days-to-pay
 *   confidence             = derived from that customer's historical variance
 *
 * The comparison then buckets the same open invoices two ways:
 *   1. Blended Weekly Average (current method) — assumes every invoice pays at
 *      the single portfolio-average days-to-pay. Smooth, but wrong per-account.
 *   2. Per-Customer Prediction (proposed)      — places each invoice in the week
 *      its own customer typically pays. Same dollars, better timing.
 */

export type Confidence = "High" | "Medium" | "Low";

export interface ARCustomer {
  name: string;
  typicalDaysToPay: number; // mock historical average
  varianceDays: number; // mock historical spread → drives confidence
  chronicLate: boolean; // pays materially slower than net terms
}

/** Mock per-customer payment behavior (illustrative). */
export const arCustomers: Record<string, ARCustomer> = {
  "Meridian Health": { name: "Meridian Health", typicalDaysToPay: 52, varianceDays: 6, chronicLate: true },
  "Northwind Logistics": { name: "Northwind Logistics", typicalDaysToPay: 34, varianceDays: 4, chronicLate: false },
  "Sterling Manufacturing": { name: "Sterling Manufacturing", typicalDaysToPay: 41, varianceDays: 9, chronicLate: true },
  "Peak Outdoor Co": { name: "Peak Outdoor Co", typicalDaysToPay: 28, varianceDays: 3, chronicLate: false },
  "Brightpath Education": { name: "Brightpath Education", typicalDaysToPay: 47, varianceDays: 14, chronicLate: true },
  "Coastal Realty Group": { name: "Coastal Realty Group", typicalDaysToPay: 33, varianceDays: 5, chronicLate: false },
  "Quill Publishing": { name: "Quill Publishing", typicalDaysToPay: 63, varianceDays: 11, chronicLate: true },
  "Atlas Fintech": { name: "Atlas Fintech", typicalDaysToPay: 22, varianceDays: 2, chronicLate: false },
  "Vertex SaaS Group": { name: "Vertex SaaS Group", typicalDaysToPay: 26, varianceDays: 4, chronicLate: false },
};

/** Snapshot date — aligned with the cash-flow forecast anchor (Mon 2026-04-06). */
export const asOfDate = "2026-04-06";

interface RawInvoice {
  invoiceNo: string;
  customer: keyof typeof arCustomers;
  amount: number;
  issueDate: string; // ISO
  termDays: number; // net terms
}

/** Open (unpaid) invoices as of the snapshot date — mock. */
const rawInvoices: RawInvoice[] = [
  { invoiceNo: "INV-2038", customer: "Sterling Manufacturing", amount: 48000, issueDate: "2026-03-09", termDays: 30 },
  { invoiceNo: "INV-2041", customer: "Meridian Health", amount: 54000, issueDate: "2026-03-16", termDays: 30 },
  { invoiceNo: "INV-2043", customer: "Northwind Logistics", amount: 57000, issueDate: "2026-03-23", termDays: 30 },
  { invoiceNo: "INV-2045", customer: "Brightpath Education", amount: 30000, issueDate: "2026-03-20", termDays: 30 },
  { invoiceNo: "INV-2047", customer: "Vertex SaaS Group", amount: 15000, issueDate: "2026-03-25", termDays: 30 },
  { invoiceNo: "INV-2050", customer: "Peak Outdoor Co", amount: 45000, issueDate: "2026-03-27", termDays: 30 },
  { invoiceNo: "INV-2052", customer: "Coastal Realty Group", amount: 28000, issueDate: "2026-03-30", termDays: 30 },
  { invoiceNo: "INV-2029", customer: "Atlas Fintech", amount: 12000, issueDate: "2026-03-30", termDays: 30 },
  { invoiceNo: "INV-2033", customer: "Quill Publishing", amount: 19000, issueDate: "2026-03-02", termDays: 30 },
];

/* ------------------------------------------------------------------ *
 * Date helpers (UTC, deterministic)
 * ------------------------------------------------------------------ */

function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(`${fromISO}T00:00:00Z`).getTime();
  const b = new Date(`${toISO}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Monday (UTC) of the ISO week containing `iso`. */
function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = d.getUTCDay(); // 0 Sun … 6 Sat
  const delta = dow === 0 ? -6 : 1 - dow;
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function confidenceFor(varianceDays: number): Confidence {
  if (varianceDays <= 5) return "High";
  if (varianceDays <= 10) return "Medium";
  return "Low";
}

/* ------------------------------------------------------------------ *
 * Portfolio-average days-to-pay (drives the "blended" method)
 * ------------------------------------------------------------------ */

export const portfolioAvgDays = Math.round(
  Object.values(arCustomers).reduce((s, c) => s + c.typicalDaysToPay, 0) /
    Object.keys(arCustomers).length
);

/* ------------------------------------------------------------------ *
 * Enriched open invoices
 * ------------------------------------------------------------------ */

export interface OpenInvoice {
  invoiceNo: string;
  customer: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  daysOutstanding: number;
  overdue: boolean;
  typicalDaysToPay: number;
  predictedPaymentDate: string; // per-customer prediction (proposed)
  blendedPaymentDate: string; // portfolio-average prediction (current)
  confidence: Confidence;
  chronicLate: boolean;
}

export const openInvoices: OpenInvoice[] = rawInvoices
  .map((r) => {
    const c = arCustomers[r.customer];
    const dueDate = addDaysISO(r.issueDate, r.termDays);
    const daysOutstanding = daysBetween(r.issueDate, asOfDate);
    return {
      invoiceNo: r.invoiceNo,
      customer: c.name,
      amount: r.amount,
      issueDate: r.issueDate,
      dueDate,
      daysOutstanding,
      overdue: daysBetween(dueDate, asOfDate) > 0,
      typicalDaysToPay: c.typicalDaysToPay,
      predictedPaymentDate: addDaysISO(r.issueDate, c.typicalDaysToPay),
      blendedPaymentDate: addDaysISO(r.issueDate, portfolioAvgDays),
      confidence: confidenceFor(c.varianceDays),
      chronicLate: c.chronicLate,
    };
  })
  .sort((a, b) => b.daysOutstanding - a.daysOutstanding);

export const totalOpenAR = openInvoices.reduce((s, i) => s + i.amount, 0);

/* ------------------------------------------------------------------ *
 * Weekly cash-in comparison — blended vs per-customer
 * ------------------------------------------------------------------ */

export interface WeekCollection {
  weekStart: string; // Monday ISO
  weekLabel: string; // "Apr 6 – 12"
  blended: number; // current method
  perCustomer: number; // proposed method
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

// Six weekly buckets starting at the snapshot Monday.
const WEEK_STARTS = Array.from({ length: 6 }, (_, i) => addDaysISO(asOfDate, i * 7));

export const weeklyCollection: WeekCollection[] = WEEK_STARTS.map((weekStart) => {
  const inWeek = (iso: string) => mondayOf(iso) === weekStart;
  const blended = openInvoices
    .filter((inv) => inWeek(inv.blendedPaymentDate))
    .reduce((s, inv) => s + inv.amount, 0);
  const perCustomer = openInvoices
    .filter((inv) => inWeek(inv.predictedPaymentDate))
    .reduce((s, inv) => s + inv.amount, 0);
  return { weekStart, weekLabel: weekLabel(weekStart), blended, perCustomer };
});

/**
 * The headline takeaway: the single week where the two methods disagree most.
 * Per-customer timing reveals a collection spike the blended average smooths away.
 */
export const largestTimingGap = weeklyCollection.reduce((best, w) =>
  Math.abs(w.perCustomer - w.blended) > Math.abs(best.perCustomer - best.blended) ? w : best
);
