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
}

export const closePeriod = "2026-06";

const AUTOMATION = "LunarLogic Automation";
const CFO = "Amy Chen (CFO)";
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
    assigned_to: CFO,
    notes:
      "Final milestone billed 6/15 but two acceptance items still open with client. Percent-complete vs. point-in-time recognition needs CFO sign-off before booking.",
    completion_timestamp: null,
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
    assigned_to: CFO,
    notes:
      "Allocation basis (headcount vs. revenue) changed this quarter. June IC-ALLOC amount ($3,450 provisional) unconfirmed — needs CFO approval before eliminating.",
    completion_timestamp: null,
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
    assigned_to: CFO,
    notes:
      "Awaiting First Meridian Bank June statement to confirm outstanding principal before finalizing the covenant certificate.",
    completion_timestamp: null,
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
