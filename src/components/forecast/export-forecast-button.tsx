"use client";

import { useState } from "react";
import { Sheet, Loader2 } from "lucide-react";
import type ExcelJSNS from "exceljs";

import { Button } from "@/components/ui/button";
import {
  openingBalance,
  anchorDate,
  minBalanceThreshold,
  forecastWeeks,
  dailyForecast,
  forecastVsActual,
  forecastAccuracy,
  projectedFourWeekNet,
} from "@/data/forecast";
import { spendingPatterns, patternAnomalies } from "@/data/patterns";
import { transactionCategoryLabels } from "@/data/transactions";

const HEADER_FILL = "FF1E3A8A";
const TITLE_COLOR = "FF1D4ED8";
const MONEY = '$#,##0;[Red]($#,##0)';
const cadenceLabel: Record<string, string> = {
  monthly: "Monthly", quarterly: "Quarterly", annual: "Annual", "one-time": "One-Time",
};
const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

type WB = ExcelJSNS.Workbook;
type WS = ExcelJSNS.Worksheet;

function titleRow(ws: WS, text: string, span: number, sub?: string) {
  ws.mergeCells(1, 1, 1, span);
  const t = ws.getCell(1, 1);
  t.value = text;
  t.font = { bold: true, size: 15, color: { argb: TITLE_COLOR } };
  ws.getRow(1).height = 22;
  if (sub) {
    ws.mergeCells(2, 1, 2, span);
    const s = ws.getCell(2, 1);
    s.value = sub;
    s.font = { size: 10, color: { argb: "FF64748B" } };
  }
}
function headerRow(ws: WS, rowIdx: number, labels: string[]) {
  const row = ws.getRow(rowIdx);
  labels.forEach((l, i) => {
    const c = row.getCell(i + 1);
    c.value = l;
    c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    c.alignment = { vertical: "middle", horizontal: i === 0 ? "left" : "right" };
  });
  row.height = 18;
  ws.views = [{ state: "frozen", ySplit: rowIdx }];
}

function buildWorkbook(ExcelJS: typeof ExcelJSNS): WB {
  const wb = new ExcelJS.Workbook();
  wb.creator = "LunarLogic";
  wb.created = new Date();

  /* ---- Sheet 1: Cash Flow Status ---- */
  const s1 = wb.addWorksheet("Status");
  titleRow(s1, "Cash Flow Status", 2, "Vanguard Digital LLC · Demo (sample data) · read-only from QuickBooks");
  s1.getColumn(1).width = 34;
  s1.getColumn(2).width = 22;
  const statusRows: [string, number | string, boolean?][] = [
    ["Opening cash position", openingBalance, true],
    ["Forecast anchor date", fmtDate(anchorDate)],
    ["Projected 4-week net", projectedFourWeekNet, true],
    ["Minimum balance threshold", minBalanceThreshold, true],
    ["Lowest projected balance", forecastAccuracy.lowestProjectedBalance, true],
    ["Lowest-balance week", forecastAccuracy.lowestBalanceWeek],
    ["Rolling forecast accuracy", `${forecastAccuracy.accuracy_pct}%`],
    ["Trailing weeks measured", forecastAccuracy.trailingWeeks],
  ];
  let r = 4;
  statusRows.forEach(([label, val, money]) => {
    const row = s1.getRow(r++);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, color: { argb: "FF334155" } };
    const c = row.getCell(2);
    c.value = val;
    c.alignment = { horizontal: "right" };
    if (money) c.numFmt = MONEY;
  });
  r++;
  const method = s1.getRow(r);
  s1.mergeCells(r, 1, r, 2);
  method.getCell(1).value =
    "Method: direct (receipts & disbursements). Inflows = open AR adjusted for customer days-to-pay + recurring revenue. Outflows = open AP + pattern-detected recurring costs + payroll & debt schedules. Net = Inflows − Outflows; running balance = prior + Net.";
  method.getCell(1).font = { size: 9, italic: true, color: { argb: "FF64748B" } };
  method.getCell(1).alignment = { wrapText: true, vertical: "top" };
  method.height = 46;

  /* ---- Sheet 2: Weekly Forecast (with formulas) ---- */
  const s2 = wb.addWorksheet("Weekly Forecast");
  titleRow(s2, "Weekly Forecast — Calculation", 6, "Net and running balance are live formulas");
  const wHead = 4;
  headerRow(s2, wHead, ["Week", "Inflows", "Outflows", "Net (=In−Out)", "End balance", "Key drivers"]);
  [34, 15, 15, 16, 16, 60].forEach((w, i) => (s2.getColumn(i + 1).width = w));
  // opening balance reference cell
  s2.getCell(wHead + 1, 5); // placeholder
  let prevBalRow = 0;
  forecastWeeks.forEach((w, i) => {
    const rowIdx = wHead + 1 + i;
    const row = s2.getRow(rowIdx);
    row.getCell(1).value = `${w.weekLabel} (${fmtDate(w.weekStart)})`;
    row.getCell(2).value = w.projected_inflows;
    row.getCell(3).value = w.projected_outflows;
    const net = w.projected_inflows - w.projected_outflows;
    row.getCell(4).value = { formula: `B${rowIdx}-C${rowIdx}`, result: net } as ExcelJSNS.CellFormulaValue;
    const balFormula = i === 0 ? `${openingBalance}+D${rowIdx}` : `E${prevBalRow}+D${rowIdx}`;
    row.getCell(5).value = { formula: balFormula, result: w.net_position } as ExcelJSNS.CellFormulaValue;
    row.getCell(6).value = w.drivers.join("; ");
    [2, 3, 4, 5].forEach((c) => (row.getCell(c).numFmt = MONEY));
    row.getCell(6).alignment = { wrapText: true };
    if (w.isCashDip) row.getCell(1).font = { color: { argb: "FFB45309" }, bold: true };
    prevBalRow = rowIdx;
  });

  /* ---- Sheet 3: Daily Projection (with formulas) ---- */
  const s3 = wb.addWorksheet("Daily Projection");
  titleRow(s3, "Daily Cash Projection — Calculation", 7,
    `Opening cash position: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(openingBalance)} · Net and running balance are live formulas`);
  const dHead = 4;
  headerRow(s3, dHead, ["Date", "Inflow", "Outflow", "Net (=In−Out)", "Running balance", "Band low", "Band high", "Notable items"]);
  [12, 13, 13, 15, 16, 13, 13, 42].forEach((w, i) => (s3.getColumn(i + 1).width = w));
  let prevRow = 0;
  dailyForecast.forEach((d, i) => {
    const rowIdx = dHead + 1 + i;
    const row = s3.getRow(rowIdx);
    row.getCell(1).value = fmtDate(d.date);
    row.getCell(2).value = d.inflow;
    row.getCell(3).value = d.outflow;
    row.getCell(4).value = { formula: `B${rowIdx}-C${rowIdx}`, result: d.net } as ExcelJSNS.CellFormulaValue;
    const balFormula = i === 0 ? `${openingBalance}+D${rowIdx}` : `E${prevRow}+D${rowIdx}`;
    row.getCell(5).value = { formula: balFormula, result: d.balance } as ExcelJSNS.CellFormulaValue;
    row.getCell(6).value = d.bandLow;
    row.getCell(7).value = d.bandHigh;
    row.getCell(8).value = d.events.join("  ·  ");
    [2, 3, 4, 5, 6, 7].forEach((c) => (row.getCell(c).numFmt = MONEY));
    prevRow = rowIdx;
  });

  /* ---- Sheet 4: Spending Patterns (supporting documentation) ---- */
  const s4 = wb.addWorksheet("Spending Patterns");
  titleRow(s4, "Spending Patterns — Supporting Documentation", 8,
    "Recurring costs detected from QuickBooks transaction history; the basis for projected outflows");
  const pHead = 4;
  headerRow(s4, pHead, ["Vendor", "Category", "Cadence", "Avg amount", "Occurrences", "Confidence", "Last occurrence", "Next projected"]);
  [30, 20, 12, 14, 12, 12, 16, 16].forEach((w, i) => (s4.getColumn(i + 1).width = w));
  spendingPatterns.forEach((p, i) => {
    const row = s4.getRow(pHead + 1 + i);
    row.getCell(1).value = p.vendor + (p.hasAnomaly ? "  ⚠" : "");
    row.getCell(2).value = transactionCategoryLabels[p.category];
    row.getCell(3).value = cadenceLabel[p.cadence];
    row.getCell(4).value = p.avgAmount;
    row.getCell(4).numFmt = MONEY;
    row.getCell(5).value = p.occurrences;
    row.getCell(6).value = p.confidence;
    row.getCell(6).numFmt = "0.00";
    row.getCell(7).value = fmtDate(p.lastOccurrence);
    row.getCell(8).value = p.nextProjected ? fmtDate(p.nextProjected) : "—";
  });

  /* ---- Sheet 5: Forecast vs Actual (accuracy) ---- */
  const s5 = wb.addWorksheet("Accuracy");
  titleRow(s5, "Forecast vs. Actual — Trailing Weeks", 9, `Rolling accuracy: ${forecastAccuracy.accuracy_pct}%`);
  const aHead = 4;
  headerRow(s5, aHead, ["Week", "Fcst inflows", "Act inflows", "Fcst outflows", "Act outflows", "Fcst net", "Act net", "Variance", "Accuracy %"]);
  [16, 14, 14, 14, 14, 14, 14, 14, 12].forEach((w, i) => (s5.getColumn(i + 1).width = w));
  forecastVsActual.forEach((w, i) => {
    const row = s5.getRow(aHead + 1 + i);
    row.getCell(1).value = w.weekLabel;
    row.getCell(2).value = w.forecast_inflows;
    row.getCell(3).value = w.actual_inflows;
    row.getCell(4).value = w.forecast_outflows;
    row.getCell(5).value = w.actual_outflows;
    row.getCell(6).value = w.forecast_net;
    row.getCell(7).value = w.actual_net;
    row.getCell(8).value = w.variance;
    row.getCell(9).value = `${w.accuracy_pct}%`;
    [2, 3, 4, 5, 6, 7, 8].forEach((c) => (row.getCell(c).numFmt = MONEY));
    row.getCell(9).alignment = { horizontal: "right" };
  });

  /* ---- Sheet 6: Anomalies ---- */
  const s6 = wb.addWorksheet("Anomalies");
  titleRow(s6, "Flagged Anomalies", 5, "Deviations detected against the recurring-cost baseline");
  const anHead = 4;
  headerRow(s6, anHead, ["Vendor", "Type", "Finding", "Date", "Confidence"]);
  [26, 20, 60, 14, 12].forEach((w, i) => (s6.getColumn(i + 1).width = w));
  patternAnomalies.forEach((a, i) => {
    const row = s6.getRow(anHead + 1 + i);
    row.getCell(1).value = a.vendor;
    row.getCell(2).value = a.headline;
    row.getCell(3).value = a.detail;
    row.getCell(3).alignment = { wrapText: true };
    row.getCell(4).value = fmtDate(a.date);
    row.getCell(5).value = a.confidence;
    row.getCell(5).numFmt = "0.00";
  });

  return wb;
}

export function ExportForecastButton() {
  const [busy, setBusy] = useState(false);
  const onExport = async () => {
    setBusy(true);
    try {
      const ExcelJS = (await import("exceljs")).default;
      const wb = buildWorkbook(ExcelJS);
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "LunarLogic-Cash-Flow-Forecast.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={onExport} disabled={busy}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sheet className="h-3.5 w-3.5" />}
      Export to Excel
    </Button>
  );
}
