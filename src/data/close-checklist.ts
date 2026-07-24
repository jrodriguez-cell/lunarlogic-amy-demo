/**
 * close-checklist.ts — June 2026 month-end close workbook
 * -------------------------------------------------------
 * 31 tasks across 8 categories. LunarLogic auto-completes the mechanical,
 * high-confidence work; humans own judgment calls and exceptions.
 *
 * Status distribution: 23 auto_completed · 5 needs_review · 2 in_progress ·
 * 1 not_started.
 *
 * The `needs_review` items line up with the rest of the demo:
 *   - the operating-account rec has 8 open items (reconciliation.ts)
 *   - a late April contractor invoice needs accrual (transactions.ts anomaly)
 *   - the intercompany IT/admin allocation basis is unconfirmed
 *   - Sterling revenue recognition needs a percent-complete judgment
 *   - the prepaid audit-fee amortization needs a service-period decision
 */

export type CloseStatus =
  | "auto_completed"
  | "needs_review"
  | "in_progress"
  | "not_started";

export type CloseCategory =
  | "bank_recs"
  | "revenue_recognition"
  | "expense_accruals"
  | "intercompany"
  | "payroll"
  | "prepaids"
  | "fixed_assets"
  | "debt";

export interface CloseChecklistItem {
  id: string;
  name: string;
  category: CloseCategory;
  status: CloseStatus;
  assigned_to: string;
  notes: string;
  completion_timestamp: string | null; // ISO 8601, null if not completed
  amount?: number; // dollar exposure of the item (present on review items)
  flagReason?: string; // short reason surfaced in "Needs Your Review"
}

export const closePeriod = "2026-06";

const AUTOMATION = "LunarLogic Automation";
const VP_FINANCE = "Amy Phillips (VP, Accounting & Finance)";
const CONTROLLER = "Marcus Webb (Controller)";
const ACCOUNTANT = "Priya Nair (Staff Accountant)";

export const closeChecklist: CloseChecklistItem[] = [
  // ---------------- Bank reconciliations ----------------
  {
    id: "CLS-01",
    name: "Reconcile operating account (Digital LLC)",
    category: "bank_recs",
    status: "needs_review",
    assigned_to: CONTROLLER,
    notes:
      "Auto-match complete: 23 of 31 items matched. 8 items require review — 4 outstanding checks, 2 deposits in transit, 1 unrecorded bank fee, 1 intercompany allocation. Adjusted bank ties to adjusted book at $341,847.17.",
    completion_timestamp: null,
    amount: 5326.27,
    flagReason: "Bank vs. GL gap ($5,326.27) — 8 reconciling items open",
  },
  {
    id: "CLS-02",
    name: "Reconcile payroll clearing account",
    category: "bank_recs",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Two June contractor runs cleared and matched to Gusto remittances.",
    completion_timestamp: "2026-07-01T06:12:00Z",
  },
  {
    id: "CLS-03",
    name: "Reconcile Holdings LLC money-market account",
    category: "bank_recs",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Intercompany transfers and interest sweep matched. Zero difference.",
    completion_timestamp: "2026-07-01T06:14:00Z",
  },
  {
    id: "CLS-04",
    name: "Reconcile corporate card (Ramp) feed",
    category: "bank_recs",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "June statement fully categorized; autopay cleared.",
    completion_timestamp: "2026-07-01T06:20:00Z",
  },

  // ---------------- Revenue recognition ----------------
  {
    id: "CLS-05",
    name: "Recognize milestone revenue — Meridian Health (May $72K)",
    category: "revenue_recognition",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Launch milestone accepted by client; recognized in period.",
    completion_timestamp: "2026-07-01T07:02:00Z",
  },
  {
    id: "CLS-06",
    name: "Recognize milestone revenue — Sterling Manufacturing (Jun $36K)",
    category: "revenue_recognition",
    status: "needs_review",
    assigned_to: VP_FINANCE,
    notes:
      "Final milestone billed 6/15 but two acceptance items still open with client. Percent-complete vs. point-in-time recognition needs VP sign-off before booking.",
    completion_timestamp: null,
    amount: 36000,
    flagReason: "Recognition method needs VP sign-off (2 acceptance items open)",
  },
  {
    id: "CLS-07",
    name: "Post monthly retainer revenue (Atlas, Vertex, Lumen)",
    category: "revenue_recognition",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "$35K combined retainers posted and matched to deposits.",
    completion_timestamp: "2026-07-01T07:05:00Z",
  },
  {
    id: "CLS-08",
    name: "Deferred revenue rollforward",
    category: "revenue_recognition",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Opening + billings − recognized = closing. No exceptions.",
    completion_timestamp: "2026-07-01T07:11:00Z",
  },
  {
    id: "CLS-09",
    name: "Unbilled AR / work-in-process true-up",
    category: "revenue_recognition",
    status: "in_progress",
    assigned_to: ACCOUNTANT,
    notes:
      "Gathering hours-to-date on Meridian and Brightpath to true up WIP against milestone schedule. ~60% complete.",
    completion_timestamp: null,
    amount: 28500,
    flagReason: "WIP true-up in progress — hours-to-date being gathered",
  },

  // ---------------- Expense accruals ----------------
  {
    id: "CLS-10",
    name: "Accrue late April contractor invoice",
    category: "expense_accruals",
    status: "needs_review",
    assigned_to: CONTROLLER,
    notes:
      "Meridian Dev Collective invoice ($7,800) for April work arrived in May and was flagged as an anomaly. Confirm it accrues to the correct prior period and is not double-counted.",
    completion_timestamp: null,
    amount: 7800,
    flagReason: "Late April contractor invoice — prior-period accrual (anomaly)",
  },
  {
    id: "CLS-11",
    name: "Accrue usage-based SaaS (AWS)",
    category: "expense_accruals",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes:
      "June AWS accrued at $5,400. Note: May double-charge already flagged and excluded pending vendor credit.",
    completion_timestamp: "2026-07-01T07:33:00Z",
  },
  {
    id: "CLS-12",
    name: "Accrue professional fees (legal)",
    category: "expense_accruals",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Quarterly accounting/legal accrual booked and matched.",
    completion_timestamp: "2026-07-01T07:36:00Z",
  },
  {
    id: "CLS-13",
    name: "Accrue Q2 estimated taxes",
    category: "expense_accruals",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "$18K Q2 estimate posted to income tax payable.",
    completion_timestamp: "2026-07-01T07:40:00Z",
  },
  {
    id: "CLS-14",
    name: "Reverse prior-month accruals",
    category: "expense_accruals",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "May accrual reversals posted; no orphaned balances.",
    completion_timestamp: "2026-07-01T07:44:00Z",
  },

  // ---------------- Intercompany ----------------
  {
    id: "CLS-15",
    name: "Post management fee Digital → Holdings ($12,000)",
    category: "intercompany",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Both sides posted; eliminates on consolidation.",
    completion_timestamp: "2026-07-01T08:02:00Z",
  },
  {
    id: "CLS-16",
    name: "Allocate shared IT / admin costs",
    category: "intercompany",
    status: "needs_review",
    assigned_to: VP_FINANCE,
    notes:
      "Allocation basis (headcount vs. revenue) changed this quarter. June IC-ALLOC amount ($3,450 provisional) unconfirmed — needs VP approval before eliminating.",
    completion_timestamp: null,
    amount: 3450,
    flagReason: "IT/admin allocation basis changed — amount unconfirmed",
  },
  {
    id: "CLS-17",
    name: "Record intercompany loan interest",
    category: "intercompany",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Term-loan interest carried at Holdings; intercompany memo posted.",
    completion_timestamp: "2026-07-01T08:07:00Z",
  },
  {
    id: "CLS-18",
    name: "Intercompany balance elimination / tie-out",
    category: "intercompany",
    status: "in_progress",
    assigned_to: ACCOUNTANT,
    notes:
      "Management fee and loan interest tie. Holding elimination open until CLS-16 allocation is confirmed.",
    completion_timestamp: null,
    amount: 3450,
    flagReason: "Elimination blocked pending CLS-16 allocation approval",
  },

  // ---------------- Payroll ----------------
  {
    id: "CLS-19",
    name: "Reconcile contractor payroll runs",
    category: "payroll",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Both June runs ($44,250 each) matched to bank and GL.",
    completion_timestamp: "2026-07-01T08:22:00Z",
  },
  {
    id: "CLS-20",
    name: "Post payroll tax liabilities",
    category: "payroll",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "June remittance ($7,880) posted and cleared.",
    completion_timestamp: "2026-07-01T08:25:00Z",
  },
  {
    id: "CLS-21",
    name: "1099 contractor accrual tracking",
    category: "payroll",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "YTD 1099 totals updated per contractor; no threshold exceptions.",
    completion_timestamp: "2026-07-01T08:29:00Z",
  },

  // ---------------- Prepaids ----------------
  {
    id: "CLS-22",
    name: "Amortize prepaid E&O insurance (annual)",
    category: "prepaids",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "March $14,400 premium amortized 1/12; schedule on track.",
    completion_timestamp: "2026-07-01T08:41:00Z",
  },
  {
    id: "CLS-23",
    name: "Amortize prepaid domain / hosting (annual)",
    category: "prepaids",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "February $4,800 renewal amortized 1/12.",
    completion_timestamp: "2026-07-01T08:43:00Z",
  },
  {
    id: "CLS-24",
    name: "Amortize prepaid audit fee",
    category: "prepaids",
    status: "needs_review",
    assigned_to: CONTROLLER,
    notes:
      "April $22,000 audit fee: decide whether to expense over the audit service period or in the month incurred. Treatment affects EBIT and the interest-coverage covenant — coordinate with CLS-30.",
    completion_timestamp: null,
    amount: 22000,
    flagReason: "Audit-fee amortization affects EBIT & interest-coverage covenant",
  },

  // ---------------- Fixed assets ----------------
  {
    id: "CLS-25",
    name: "Record monthly depreciation",
    category: "fixed_assets",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Depreciation run posted per schedule.",
    completion_timestamp: "2026-07-01T09:02:00Z",
  },
  {
    id: "CLS-26",
    name: "Capitalize new equipment purchases",
    category: "fixed_assets",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Two workstation purchases capitalized above threshold.",
    completion_timestamp: "2026-07-01T09:05:00Z",
  },
  {
    id: "CLS-27",
    name: "Fixed asset roll-forward review",
    category: "fixed_assets",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Additions + disposals reconcile to subledger.",
    completion_timestamp: "2026-07-01T09:09:00Z",
  },

  // ---------------- Debt ----------------
  {
    id: "CLS-28",
    name: "Record term loan interest (Holdings)",
    category: "debt",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "June interest ($10,600) posted; matches amortization schedule.",
    completion_timestamp: "2026-07-01T09:20:00Z",
  },
  {
    id: "CLS-29",
    name: "Update debt amortization schedule",
    category: "debt",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes: "Principal and interest split rolled forward one period.",
    completion_timestamp: "2026-07-01T09:23:00Z",
  },
  {
    id: "CLS-30",
    name: "Covenant compliance calculation",
    category: "debt",
    status: "auto_completed",
    assigned_to: AUTOMATION,
    notes:
      "June actuals computed: current ratio 1.78x, D/E 2.68x, interest coverage 2.40x. Interest coverage flagged — projected to breach 2.0x floor in August. Feeds Covenant Monitor.",
    completion_timestamp: "2026-07-01T09:27:00Z",
  },
  {
    id: "CLS-31",
    name: "Loan balance confirmation vs. lender statement",
    category: "debt",
    status: "not_started",
    assigned_to: VP_FINANCE,
    notes:
      "Awaiting First Meridian Bank June statement to confirm outstanding principal before finalizing the covenant certificate.",
    completion_timestamp: null,
    amount: 1372160,
    flagReason: "Awaiting lender statement to confirm principal",
  },
];

/* ------------------------------------------------------------------ *
 * Derived summary (drives the close progress meter)
 * ------------------------------------------------------------------ */

const countBy = (status: CloseStatus) =>
  closeChecklist.filter((i) => i.status === status).length;

export const closeSummary = {
  period: closePeriod,
  total: closeChecklist.length, // 31
  autoCompleted: countBy("auto_completed"), // 23
  needsReview: countBy("needs_review"), // 5
  inProgress: countBy("in_progress"), // 2
  notStarted: countBy("not_started"), // 1
  get completionPct() {
    return Math.round((this.autoCompleted / this.total) * 100);
  },
};

export const closeCategories: CloseCategory[] = [
  "bank_recs",
  "revenue_recognition",
  "expense_accruals",
  "intercompany",
  "payroll",
  "prepaids",
  "fixed_assets",
  "debt",
];

export const closeCategoryLabels: Record<CloseCategory, string> = {
  bank_recs: "Bank Reconciliations",
  revenue_recognition: "Revenue Recognition",
  expense_accruals: "Expense Accruals",
  intercompany: "Intercompany",
  payroll: "Payroll",
  prepaids: "Prepaids",
  fixed_assets: "Fixed Assets",
  debt: "Debt",
};

export interface CloseCategoryProgress {
  category: CloseCategory;
  label: string;
  completed: number; // auto_completed
  remaining: number; // everything not yet auto_completed
  total: number;
}

/** Per-category completed vs. remaining, for the close completion bar chart. */
export const closeByCategory: CloseCategoryProgress[] = closeCategories.map(
  (category) => {
    const items = closeChecklist.filter((i) => i.category === category);
    const completed = items.filter((i) => i.status === "auto_completed").length;
    return {
      category,
      label: closeCategoryLabels[category],
      completed,
      remaining: items.length - completed,
      total: items.length,
    };
  }
);

/**
 * The 8 items needing a human — everything not auto-completed. Ordered so the
 * hard stops (needs_review) surface above work already moving (in_progress)
 * and unstarted items.
 */
const REVIEW_ORDER: Record<CloseStatus, number> = {
  needs_review: 0,
  in_progress: 1,
  not_started: 2,
  auto_completed: 3,
};

export const reviewItems: CloseChecklistItem[] = closeChecklist
  .filter((i) => i.status !== "auto_completed")
  .sort((a, b) => REVIEW_ORDER[a.status] - REVIEW_ORDER[b.status]);

/* ------------------------------------------------------------------ *
 * Tie-out amounts (GL vs. supporting) per item
 * ------------------------------------------------------------------ *
 * Not every close task is a balance tie-out, so only items with a
 * meaningful GL/supporting comparison appear here. A variance at or above
 * the materiality threshold is flagged in the UI. The material variances
 * are exactly the open review items — the bank-rec gross gap (which
 * reconciles to $0 in the detail panel), the WIP true-up, the late April
 * accrual, and the unconfirmed intercompany allocation.
 */

export const materialityThreshold = 1000;

export interface TieOut {
  glAmount: number;
  supportingAmount: number | null; // null = supporting document still pending
}

export const closeTieOuts: Record<string, TieOut> = {
  "CLS-01": { glAmount: 341892.17, supportingAmount: 347218.44 },
  "CLS-02": { glAmount: 88500, supportingAmount: 88500 },
  "CLS-03": { glAmount: 250000, supportingAmount: 250000 },
  "CLS-04": { glAmount: 4120, supportingAmount: 4120 },
  "CLS-05": { glAmount: 72000, supportingAmount: 72000 },
  "CLS-06": { glAmount: 36000, supportingAmount: 36000 },
  "CLS-07": { glAmount: 35000, supportingAmount: 35000 },
  "CLS-08": { glAmount: 45000, supportingAmount: 45000 },
  "CLS-09": { glAmount: 26000, supportingAmount: 28500 },
  "CLS-10": { glAmount: 0, supportingAmount: 7800 },
  "CLS-11": { glAmount: 5400, supportingAmount: 5400 },
  "CLS-12": { glAmount: 6000, supportingAmount: 6000 },
  "CLS-13": { glAmount: 18000, supportingAmount: 18000 },
  "CLS-15": { glAmount: 12000, supportingAmount: 12000 },
  "CLS-16": { glAmount: 0, supportingAmount: 3450 },
  "CLS-17": { glAmount: 10600, supportingAmount: 10600 },
  "CLS-18": { glAmount: 12000, supportingAmount: 15450 },
  "CLS-19": { glAmount: 88500, supportingAmount: 88500 },
  "CLS-20": { glAmount: 7880, supportingAmount: 7880 },
  "CLS-22": { glAmount: 1200, supportingAmount: 1200 },
  "CLS-23": { glAmount: 400, supportingAmount: 400 },
  "CLS-24": { glAmount: 22000, supportingAmount: 22000 },
  "CLS-25": { glAmount: 3500, supportingAmount: 3500 },
  "CLS-26": { glAmount: 6800, supportingAmount: 6800 },
  "CLS-28": { glAmount: 10600, supportingAmount: 10600 },
  "CLS-31": { glAmount: 1372160, supportingAmount: null },
};

export interface TieOutResult extends TieOut {
  variance: number | null; // null when supporting is pending
  isMaterial: boolean;
}

export function getTieOut(id: string): TieOutResult | null {
  const t = closeTieOuts[id];
  if (!t) return null;
  const variance =
    t.supportingAmount === null
      ? null
      : Number((t.glAmount - t.supportingAmount).toFixed(2));
  return {
    ...t,
    variance,
    isMaterial: variance !== null && Math.abs(variance) >= materialityThreshold,
  };
}

/* ------------------------------------------------------------------ *
 * Close run metadata (status bar + close package)
 * ------------------------------------------------------------------ */

export const closeMeta = {
  periodLabel: "June 2026 Month-End Close",
  dayOfClose: 3,
  targetDays: 3,
  /** On track: the 8 human items are in flight and on pace to close today. */
  onTrack: true,
  timeSavedHours: 34,
  preparer: "LunarLogic Automation · Priya Nair",
  reviewer: "Marcus Webb (Controller)",
  approver: "Amy Phillips (VP, Accounting & Finance)",
  dateCompleted: "2026-07-03",
  entity: "Vanguard Digital LLC",
  // Period lock / tamper-evidence for the audit package
  locked: true,
  version: "v1",
  lockedAt: "2026-07-03T17:20:00Z",
  packageId: "CP-2026-06-VDL",
  contentHash: "sha256:9f2a4c1e…e1b7",
};

/* ------------------------------------------------------------------ *
 * Supporting documentation & per-item audit trail (audit package)
 * ------------------------------------------------------------------ */

export type DocSource = "QuickBooks" | "Plaid" | "Gusto" | "Schedule" | "Document";

export interface SupportingDoc {
  label: string;
  source: DocSource;
  ref?: string; // GL account / trace-to-source reference
}

export interface AuditEvent {
  ts: string; // ISO
  actor: string;
  event: string;
}

/** GL account each category traces back to (trace-to-source). */
const CATEGORY_GL: Record<CloseCategory, string> = {
  bank_recs: "1000 · Operating Cash",
  revenue_recognition: "4000 · Revenue",
  expense_accruals: "6000 · Operating Expenses",
  intercompany: "8000 · Intercompany",
  payroll: "6000 · Contractor Payroll",
  prepaids: "1300 · Prepaid Expenses",
  fixed_assets: "1500 · Fixed Assets",
  debt: "2700 · Term Loan",
};

const CATEGORY_DOCS: Record<CloseCategory, SupportingDoc[]> = {
  bank_recs: [
    { label: "Bank statement — First Meridian (June)", source: "Document" },
    { label: "Plaid cleared-transaction feed", source: "Plaid" },
    { label: "QBO cash-account register", source: "QuickBooks" },
  ],
  revenue_recognition: [
    { label: "Milestone acceptance / SOW", source: "Document" },
    { label: "Deferred revenue rollforward", source: "Schedule" },
    { label: "QBO invoices & journal entries", source: "QuickBooks" },
  ],
  expense_accruals: [
    { label: "Vendor invoices", source: "Document" },
    { label: "Accrual schedule", source: "Schedule" },
    { label: "QBO bills & journal entries", source: "QuickBooks" },
  ],
  intercompany: [
    { label: "Management-fee agreement", source: "Document" },
    { label: "Allocation basis worksheet", source: "Schedule" },
    { label: "QBO entries — both company files", source: "QuickBooks" },
  ],
  payroll: [
    { label: "Gusto payroll report", source: "Gusto" },
    { label: "Payroll tax filings", source: "Document" },
    { label: "QBO GL postings", source: "QuickBooks" },
  ],
  prepaids: [
    { label: "Prepaid amortization schedule", source: "Schedule" },
    { label: "Original vendor invoice", source: "Document" },
    { label: "QBO prepaid account", source: "QuickBooks" },
  ],
  fixed_assets: [
    { label: "Fixed-asset register", source: "Schedule" },
    { label: "Depreciation schedule", source: "Schedule" },
    { label: "QBO fixed-asset accounts", source: "QuickBooks" },
  ],
  debt: [
    { label: "Loan agreement", source: "Document" },
    { label: "Amortization schedule", source: "Schedule" },
    { label: "Lender statement", source: "Document" },
  ],
};

const RULE_BY_CATEGORY: Record<CloseCategory, string> = {
  bank_recs: "bank feed matched to register; net difference $0.00",
  revenue_recognition: "recognized entries tie to schedule; deferred rollforward balances",
  expense_accruals: "recurring accruals present per pattern engine",
  intercompany: "posted in both files; elimination entry balanced",
  payroll: "Gusto runs reconciled to GL and tax liabilities",
  prepaids: "amortization posted per schedule",
  fixed_assets: "depreciation and additions tie to the subledger",
  debt: "interest ties to the amortization schedule",
};

/** GL account this item traces back to. */
export function getSourceRef(item: CloseChecklistItem): string {
  return CATEGORY_GL[item.category];
}

/** Supporting documents backing an item; the QBO source carries the GL ref. */
export function getSupportingDocs(item: CloseChecklistItem): SupportingDoc[] {
  return CATEGORY_DOCS[item.category].map((d) =>
    d.source === "QuickBooks" ? { ...d, ref: CATEGORY_GL[item.category] } : d
  );
}

/** Immutable per-item event history for the audit trail. */
export function getItemAuditTrail(item: CloseChecklistItem): AuditEvent[] {
  const events: AuditEvent[] = [
    { ts: "2026-07-01T06:02:00Z", actor: "LunarLogic Automation", event: "Source data synced from QuickBooks" },
  ];
  if (item.status === "auto_completed") {
    events.push({
      ts: item.completion_timestamp ?? "2026-07-01T06:20:00Z",
      actor: "LunarLogic Automation",
      event: `Rule passed — ${RULE_BY_CATEGORY[item.category]}; auto-completed with evidence`,
    });
    events.push({ ts: closeMeta.lockedAt, actor: closeMeta.reviewer, event: "Reviewed and included in the locked close package" });
  } else if (item.status === "needs_review") {
    events.push({ ts: "2026-07-01T06:05:00Z", actor: "LunarLogic Automation", event: `Flagged for review — ${item.flagReason ?? "exception raised"}` });
    events.push({ ts: "2026-07-03T10:15:00Z", actor: item.assigned_to, event: "Assigned to reviewer — pending decision" });
  } else if (item.status === "in_progress") {
    events.push({ ts: "2026-07-02T14:30:00Z", actor: item.assigned_to, event: "In progress — gathering supporting documentation" });
  } else {
    events.push({ ts: "2026-07-01T06:05:00Z", actor: "LunarLogic Automation", event: "Awaiting prerequisite / supporting document" });
  }
  return events;
}
