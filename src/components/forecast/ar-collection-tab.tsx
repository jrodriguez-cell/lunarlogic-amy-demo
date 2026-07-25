"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, TriangleAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionCard } from "@/components/dashboard/section-card";
import { chartColors, tooltipStyle, axisTick } from "@/lib/chart-theme";
import { cn, formatCurrency, formatCompactCurrency } from "@/lib/utils";
import {
  openInvoices,
  weeklyCollection,
  portfolioAvgDays,
  totalOpenAR,
  largestTimingGap,
  asOfDate,
  type Confidence,
} from "@/data/ar-collection";

type Method = "perCustomer" | "blended";

const METHODS: { key: Method; label: string; sub: string }[] = [
  { key: "blended", label: "Blended Weekly Average", sub: "current method" },
  { key: "perCustomer", label: "Per-Customer Prediction", sub: "proposed" },
];

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function ConfidenceBadge({ level }: { level: Confidence }) {
  const tone =
    level === "High"
      ? "bg-green-400/10 text-green-400 border-green-400/20"
      : level === "Medium"
        ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
        : "bg-red-400/10 text-red-400 border-red-400/20";
  return (
    <span className={cn("inline-block rounded border px-1.5 py-0.5 text-xs font-semibold", tone)}>
      {level}
    </span>
  );
}

type Row = (typeof weeklyCollection)[number];

function ComparisonTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  const delta = r.perCustomer - r.blended;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold text-slate-100">Week of {r.weekLabel}</div>
      <div className="mt-1 flex items-center gap-1.5 text-slate-300">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.slate500 }} />
        Blended {formatCompactCurrency(r.blended)}
      </div>
      <div className="flex items-center gap-1.5 text-slate-300">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.blue }} />
        Per-customer {formatCompactCurrency(r.perCustomer)}
      </div>
      {delta !== 0 && (
        <div className="mt-0.5 text-[11px] text-slate-500">
          Δ {delta > 0 ? "+" : ""}
          {formatCompactCurrency(delta)} vs. blended
        </div>
      )}
    </div>
  );
}

export function ARCollectionTab() {
  const [method, setMethod] = useState<Method>("perCustomer");

  const gapDelta = largestTimingGap.perCustomer - largestTimingGap.blended;

  return (
    <div className="space-y-6">
      {/* Concept label + open AR summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-medium text-blue-200">
          Illustrative concept — demo data
        </span>
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200 tabular-nums">{formatCurrency(totalOpenAR)}</span>{" "}
          open AR · {openInvoices.length} invoices · as of {fmtDate(asOfDate)}
        </div>
      </div>

      {/* Method comparison */}
      <SectionCard
        title="Weekly Cash-In — Current vs. Proposed"
        subtitle={`Same open invoices, bucketed two ways. Blended assumes every account pays at the ${portfolioAvgDays}-day portfolio average; per-customer uses each account's own typical days-to-pay.`}
        legend={[
          { label: "Blended weekly average (current)", color: chartColors.slate500, variant: "solid" },
          { label: "Per-customer prediction (proposed)", color: chartColors.blue, variant: "solid" },
        ]}
      >
        {/* Toggle — emphasize one method without hiding the comparison */}
        <div
          role="tablist"
          aria-label="Collection forecasting method"
          className="mb-4 inline-flex gap-1 rounded-lg border border-slate-700 bg-slate-800/40 p-1"
        >
          {METHODS.map((m) => {
            const active = method === m.key;
            return (
              <button
                key={m.key}
                role="tab"
                aria-selected={active}
                onClick={() => setMethod(m.key)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                  active ? "bg-slate-700/70 text-slate-100" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {m.label}
                <span className="ml-1.5 hidden text-[11px] font-normal text-slate-500 sm:inline">
                  {m.sub}
                </span>
              </button>
            );
          })}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyCollection} margin={{ top: 8, right: 16, bottom: 4, left: 4 }} barGap={2}>
            <XAxis
              dataKey="weekLabel"
              tick={axisTick}
              tickLine={false}
              axisLine={{ stroke: chartColors.grid }}
              angle={-18}
              textAnchor="end"
              height={44}
            />
            <YAxis
              width={56}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              domain={[0, 140000]}
              ticks={[0, 40000, 80000, 120000]}
              tickFormatter={(v: number) => formatCompactCurrency(v)}
            />
            <ReferenceLine y={0} stroke={chartColors.slate500} strokeWidth={1} />
            <Bar
              dataKey="blended"
              fill={chartColors.slate500}
              fillOpacity={method === "blended" ? 1 : 0.35}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
              maxBarSize={26}
            />
            <Bar
              dataKey="perCustomer"
              fill={chartColors.blue}
              fillOpacity={method === "perCustomer" ? 1 : 0.35}
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
              maxBarSize={26}
            />
            <Tooltip content={<ComparisonTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
          </BarChart>
        </ResponsiveContainer>

        {/* Takeaway */}
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-blue-400/20 bg-blue-400/[0.06] px-3 py-2.5">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
          <p className="text-xs text-slate-300">
            Week of <span className="font-semibold text-slate-100">{largestTimingGap.weekLabel}</span>: the
            blended average predicts{" "}
            <span className="font-semibold text-slate-200">{formatCompactCurrency(largestTimingGap.blended)}</span>{" "}
            in, but per-customer timing shows{" "}
            <span className="font-semibold text-blue-300">{formatCompactCurrency(largestTimingGap.perCustomer)}</span>{" "}
            — a <span className="font-semibold text-blue-300">{formatCompactCurrency(Math.abs(gapDelta))}</span>{" "}
            collection spike the blended method smooths away. Slow payers (e.g. Quill, Meridian) shift right;
            fast payers (Atlas, Peak, Vertex) pull earlier.
          </p>
        </div>
      </SectionCard>

      {/* Weekly totals table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Week</th>
                <th className="px-4 py-3 text-right font-semibold">Blended (current)</th>
                <th className="px-4 py-3 text-right font-semibold">Per-customer (proposed)</th>
                <th className="px-4 py-3 text-right font-semibold">Δ Timing</th>
              </tr>
            </thead>
            <tbody>
              {weeklyCollection.map((w) => {
                const delta = w.perCustomer - w.blended;
                return (
                  <tr key={w.weekStart} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-200">{w.weekLabel}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                      {w.blended ? formatCurrency(w.blended) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-100">
                      {w.perCustomer ? formatCurrency(w.perCustomer) : "—"}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right tabular-nums font-semibold",
                        delta > 0 ? "text-green-400" : delta < 0 ? "text-amber-400" : "text-slate-600"
                      )}
                    >
                      {delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${formatCompactCurrency(delta)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Open invoices */}
      <div>
        <h3 className="mb-3 font-heading text-base font-semibold text-slate-200">
          Open Invoices — Predicted Payment
        </h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Invoice</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Due</th>
                  <th className="px-4 py-3 text-right font-semibold">Days out</th>
                  <th className="px-4 py-3 font-semibold">Predicted payment</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {openInvoices.map((inv) => (
                  <tr
                    key={inv.invoiceNo}
                    className={cn(
                      "border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30",
                      inv.overdue && "bg-amber-400/[0.04]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-100">{inv.customer}</span>
                        {inv.chronicLate && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                            <TriangleAlert className="h-3 w-3" />
                            Chronic late
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Typically pays in {inv.typicalDaysToPay}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 tabular-nums">{inv.invoiceNo}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-slate-200">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-400">
                      {fmtDate(inv.dueDate)}
                      {inv.overdue && <span className="ml-1.5 text-[11px] font-semibold text-amber-400">overdue</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-300">{inv.daysOutstanding}d</td>
                    <td className="px-4 py-3 tabular-nums font-semibold text-blue-300">
                      {fmtDate(inv.predictedPaymentDate)}
                    </td>
                    <td className="px-4 py-3">
                      <ConfidenceBadge level={inv.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="mt-2 text-[11px] text-slate-600">
          Predicted payment = invoice date + the customer&apos;s typical days-to-pay (mock rule). Confidence
          reflects each account&apos;s historical payment-timing variance. Illustrative only — no live QuickBooks
          or prediction model is connected.
        </p>
      </div>
    </div>
  );
}
