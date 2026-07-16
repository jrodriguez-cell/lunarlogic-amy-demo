/**
 * reconciliation.ts — June 2026 month-end bank reconciliation
 * -----------------------------------------------------------
 * Vanguard Digital LLC operating account (First Meridian Bank).
 *
 * The reconciling items below bridge the bank statement balance to the GL
 * balance exactly: adjusted bank balance == adjusted book balance ==
 * $341,847.17 (see `tieOut`). Nothing is left unexplained.
 *
 *   Adjusted bank = Bank balance − outstanding checks + deposits in transit
 *   Adjusted book = GL balance − bank fee not yet recorded
 *
 * Line items: 31 total → 23 auto-matched, 8 requiring review. The 8 review
 * items are the four outstanding checks, two deposits in transit, one
 * unrecorded bank fee, and one intercompany shared-cost allocation whose
 * amount is still being confirmed.
 */

export const reconciliationPeriod = "2026-06";
export const reconciliationEntity = "Vanguard Digital LLC";
export const bankName = "First Meridian Bank — Operating";
export const statementDate = "2026-06-30";

export const bankBalance = 347218.44;
export const glBalance = 341892.17;

/**
 * Current cash position and week-over-week movement for the operating
 * account, used by the dashboard "Cash Position" stat card.
 */
export const cashPosition = {
  current: bankBalance, // 347,218.44
  priorWeek: 334512.1,
  get wowDelta() {
    return Number((this.current - this.priorWeek).toFixed(2));
  },
  get wowPct() {
    return Number(((this.wowDelta / this.priorWeek) * 100).toFixed(1));
  },
};

/* ------------------------------------------------------------------ *
 * Reconciling items
 * ------------------------------------------------------------------ */

export interface ReconcilingItem {
  ref: string;
  date: string;
  description: string;
  amount: number; // magnitude; sign is implied by `kind`
  kind: "outstanding_check" | "deposit_in_transit" | "bank_fee";
}

export const outstandingChecks: ReconcilingItem[] = [
  { ref: "CHK-4021", date: "2026-06-26", description: "Meridian Dev Collective — contractor settlement", amount: 6500.0, kind: "outstanding_check" },
  { ref: "CHK-4022", date: "2026-06-27", description: "WorkHaus Coworking — July rent prepay", amount: 4821.27, kind: "outstanding_check" },
  { ref: "CHK-4023", date: "2026-06-29", description: "Pillar Insurance — policy adjustment", amount: 3200.0, kind: "outstanding_check" },
  { ref: "CHK-4024", date: "2026-06-30", description: "Hollis & Barrow CPA — interim billing", amount: 2500.0, kind: "outstanding_check" },
];

export const depositsInTransit: ReconcilingItem[] = [
  { ref: "DIT-0619", date: "2026-06-30", description: "Sterling Manufacturing — milestone remittance (ACH in transit)", amount: 8450.0, kind: "deposit_in_transit" },
  { ref: "DIT-0628", date: "2026-06-30", description: "Coastal Realty Group — final payment (lockbox, next-day)", amount: 3200.0, kind: "deposit_in_transit" },
];

export const bankFeesNotRecorded: ReconcilingItem[] = [
  { ref: "FEE-0630", date: "2026-06-30", description: "Monthly account analysis / wire fees not yet booked to GL", amount: 45.0, kind: "bank_fee" },
];

const sum = (items: ReconcilingItem[]) => items.reduce((s, i) => s + i.amount, 0);

const outstandingChecksTotal = sum(outstandingChecks);
const depositsInTransitTotal = sum(depositsInTransit);
const bankFeesTotal = sum(bankFeesNotRecorded);

export const tieOut = {
  bankBalance,
  outstandingChecksTotal,
  depositsInTransitTotal,
  adjustedBankBalance: Number(
    (bankBalance - outstandingChecksTotal + depositsInTransitTotal).toFixed(2)
  ),
  glBalance,
  bankFeesTotal,
  adjustedBookBalance: Number((glBalance - bankFeesTotal).toFixed(2)),
  get difference() {
    return Number((this.adjustedBankBalance - this.adjustedBookBalance).toFixed(2));
  },
  get isReconciled() {
    return this.difference === 0;
  },
};

/* ------------------------------------------------------------------ *
 * Intercompany items (Digital LLC ⇄ Holdings LLC)
 * ------------------------------------------------------------------ */

export interface IntercompanyItem {
  ref: string;
  description: string;
  from: "digital_llc" | "holdings_llc";
  to: "digital_llc" | "holdings_llc";
  amount: number;
  frequency: "monthly";
  status: "matched" | "needs_review";
  note?: string;
}

export const intercompanyItems: IntercompanyItem[] = [
  {
    ref: "IC-MGMT-0630",
    description: "Management fee — operating subsidiary to parent",
    from: "digital_llc",
    to: "holdings_llc",
    amount: 12000.0,
    frequency: "monthly",
    status: "matched",
  },
  {
    ref: "IC-ALLOC-0630",
    description: "Shared IT / admin cost allocation — parent to subsidiary",
    from: "holdings_llc",
    to: "digital_llc",
    amount: 3450.0,
    frequency: "monthly",
    status: "needs_review",
    note: "Allocation driver (headcount vs. revenue basis) under review — amount not yet confirmed for June.",
  },
  {
    ref: "IC-INT-0630",
    description: "Term-loan interest carried at Holdings (Digital share, informational)",
    from: "holdings_llc",
    to: "holdings_llc",
    amount: 10600.0,
    frequency: "monthly",
    status: "matched",
    note: "Debt service sits at the Holdings entity; shown here for intercompany completeness. Matches covenants.ts interest expense.",
  },
];

/* ------------------------------------------------------------------ *
 * Reconciliation line items (31 total)
 * ------------------------------------------------------------------ */

export type MatchStatus = "auto_matched" | "needs_review";

export interface ReconciliationLineItem {
  id: string;
  date: string;
  description: string;
  amount: number; // signed: + increases bank cash, − decreases it
  type: "deposit" | "payment" | "fee" | "transfer";
  glAccount: string;
  matchStatus: MatchStatus;
  note?: string;
}

const autoMatched: Omit<ReconciliationLineItem, "id" | "matchStatus">[] = [
  { date: "2026-06-05", description: "Atlas Fintech — monthly retainer", amount: 12000.0, type: "deposit", glAccount: "4000 · Retainer Revenue" },
  { date: "2026-06-05", description: "Vertex SaaS Group — monthly retainer", amount: 15000.0, type: "deposit", glAccount: "4000 · Retainer Revenue" },
  { date: "2026-06-05", description: "Lumen Media — monthly retainer", amount: 8000.0, type: "deposit", glAccount: "4000 · Retainer Revenue" },
  { date: "2026-06-15", description: "Sterling Manufacturing — final milestone", amount: 36000.0, type: "deposit", glAccount: "4010 · Project Revenue" },
  { date: "2026-06-24", description: "Quill Publishing — final milestone", amount: 19000.0, type: "deposit", glAccount: "4010 · Project Revenue" },
  { date: "2026-06-08", description: "Northwind Logistics — AR settlement", amount: 9500.0, type: "deposit", glAccount: "1200 · Accounts Receivable" },
  { date: "2026-06-20", description: "Copper & Vine — AR settlement", amount: 3750.0, type: "deposit", glAccount: "1200 · Accounts Receivable" },
  { date: "2026-06-25", description: "SaaS annual proration credit", amount: 540.0, type: "deposit", glAccount: "6200 · Software & SaaS" },
  { date: "2026-06-29", description: "Sweep account interest income", amount: 128.0, type: "deposit", glAccount: "7100 · Interest Income" },
  { date: "2026-06-15", description: "Gusto — contractor payroll run", amount: -44250.0, type: "payment", glAccount: "6000 · Contractor Payroll" },
  { date: "2026-06-30", description: "Gusto — contractor payroll run", amount: -44250.0, type: "payment", glAccount: "6000 · Contractor Payroll" },
  { date: "2026-06-22", description: "Payroll tax remittance", amount: -7880.0, type: "payment", glAccount: "6010 · Payroll Taxes" },
  { date: "2026-06-02", description: "Amazon Web Services — usage", amount: -5400.0, type: "payment", glAccount: "6200 · Software & SaaS" },
  { date: "2026-06-03", description: "Adobe Creative Cloud", amount: -1820.0, type: "payment", glAccount: "6200 · Software & SaaS" },
  { date: "2026-06-05", description: "Figma", amount: -880.0, type: "payment", glAccount: "6200 · Software & SaaS" },
  { date: "2026-06-07", description: "Slack", amount: -640.0, type: "payment", glAccount: "6200 · Software & SaaS" },
  { date: "2026-06-18", description: "Ramp corporate card — autopay", amount: -4120.0, type: "payment", glAccount: "6300 · Corporate Card" },
  { date: "2026-06-01", description: "WorkHaus Coworking — June rent", amount: -3200.0, type: "payment", glAccount: "6400 · Office & Rent" },
  { date: "2026-06-10", description: "Pillar Insurance — general liability", amount: -2400.0, type: "payment", glAccount: "6500 · Insurance" },
  { date: "2026-06-12", description: "Hollis & Barrow CPA — quarterly accounting/legal", amount: -6000.0, type: "payment", glAccount: "6600 · Professional Services" },
  { date: "2026-06-16", description: "Estimated tax payment (Q2)", amount: -18000.0, type: "payment", glAccount: "2400 · Income Tax Payable" },
  { date: "2026-06-30", description: "Intercompany management fee — to Holdings", amount: -12000.0, type: "transfer", glAccount: "8000 · Intercompany" },
  { date: "2026-06-26", description: "Stripe — merchant processing fees", amount: -310.0, type: "fee", glAccount: "6700 · Bank & Merchant Fees" },
];

const needsReview: Omit<ReconciliationLineItem, "id" | "matchStatus">[] = [
  { date: "2026-06-26", description: "Outstanding check CHK-4021 — Meridian Dev Collective", amount: -6500.0, type: "payment", glAccount: "6000 · Contractor Payroll", note: "Issued, not yet cleared bank." },
  { date: "2026-06-27", description: "Outstanding check CHK-4022 — WorkHaus July prepay", amount: -4821.27, type: "payment", glAccount: "1300 · Prepaid Expenses", note: "Issued, not yet cleared bank." },
  { date: "2026-06-29", description: "Outstanding check CHK-4023 — Pillar Insurance adj.", amount: -3200.0, type: "payment", glAccount: "6500 · Insurance", note: "Issued, not yet cleared bank." },
  { date: "2026-06-30", description: "Outstanding check CHK-4024 — Hollis & Barrow interim", amount: -2500.0, type: "payment", glAccount: "6600 · Professional Services", note: "Issued, not yet cleared bank." },
  { date: "2026-06-30", description: "Deposit in transit DIT-0619 — Sterling ACH", amount: 8450.0, type: "deposit", glAccount: "1200 · Accounts Receivable", note: "Recorded in GL; hits bank next business day." },
  { date: "2026-06-30", description: "Deposit in transit DIT-0628 — Coastal Realty lockbox", amount: 3200.0, type: "deposit", glAccount: "1200 · Accounts Receivable", note: "Recorded in GL; hits bank next business day." },
  { date: "2026-06-30", description: "Bank fee FEE-0630 — account analysis / wire fees", amount: -45.0, type: "fee", glAccount: "6700 · Bank & Merchant Fees", note: "On statement; not yet booked to GL." },
  { date: "2026-06-30", description: "Intercompany shared IT/admin allocation (IC-ALLOC-0630)", amount: -3450.0, type: "transfer", glAccount: "8000 · Intercompany", note: "Allocation basis under review — amount unconfirmed for June." },
];

export const reconciliationLineItems: ReconciliationLineItem[] = [
  ...autoMatched.map((item, i) => ({
    ...item,
    id: `REC-${String(i + 1).padStart(3, "0")}`,
    matchStatus: "auto_matched" as const,
  })),
  ...needsReview.map((item, i) => ({
    ...item,
    id: `REC-${String(autoMatched.length + i + 1).padStart(3, "0")}`,
    matchStatus: "needs_review" as const,
  })),
];

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

export const reconciliationSummary = {
  period: reconciliationPeriod,
  entity: reconciliationEntity,
  statementDate,
  bankBalance,
  glBalance,
  adjustedBalance: tieOut.adjustedBankBalance,
  isReconciled: tieOut.isReconciled,
  difference: tieOut.difference,
  totalLineItems: reconciliationLineItems.length, // 31
  autoMatchedCount: reconciliationLineItems.filter((i) => i.matchStatus === "auto_matched").length, // 23
  needsReviewCount: reconciliationLineItems.filter((i) => i.matchStatus === "needs_review").length, // 8
  outstandingCheckCount: outstandingChecks.length, // 4
  depositsInTransitCount: depositsInTransit.length, // 2
  bankFeeCount: bankFeesNotRecorded.length, // 1
};
