"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/dashboard/section-card";
import { chartColors, tooltipStyle, axisTick } from "@/lib/chart-theme";
import { cn, formatCompactCurrency, formatCurrency } from "@/lib/utils";
import { forecastVsActual, forecastAccuracy } from "@/data/forecast";

interface CmpRow {
  week: string;
  projected: number;
  actual: number;
}

function ComparisonChart({ rows, color }: { rows: CmpRow[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 4 }} barGap={4}>
        <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={{ stroke: chartColors.grid }} interval={0} />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatCompactCurrency(v)}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.06)" }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#F1F5F9", fontWeight: 600 }}
          formatter={(v: number, name: string) => [formatCurrency(v), name === "projected" ? "Projected" : "Actual"]}
        />
        <Bar dataKey="projected" fill={color} fillOpacity={0.4} radius={[3, 3, 0, 0]} isAnimationActive={false} maxBarSize={26} />
        <Bar dataKey="actual" fill={color} radius={[3, 3, 0, 0]} isAnimationActive={false} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AccuracyTab() {
  const inflowRows: CmpRow[] = forecastVsActual.map((w) => ({
    week: w.weekLabel,
    projected: w.forecast_inflows,
    actual: w.actual_inflows,
  }));
  const outflowRows: CmpRow[] = forecastVsActual.map((w) => ({
    week: w.weekLabel,
    projected: w.forecast_outflows,
    actual: w.actual_outflows,
  }));

  return (
    <div className="space-y-6">
      {/* Rolling accuracy hero + per-week strip */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
          <div className="lg:w-64">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Rolling forecast accuracy
            </p>
            <p className="mt-1 font-heading text-5xl font-semibold text-green-400">
              {forecastAccuracy.accuracy_pct}%
            </p>
            <p className="mt-1 text-sm text-slate-400">
              over the last {forecastAccuracy.trailingWeeks} weeks
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
            {forecastVsActual.map((w) => (
              <div key={w.weekStart} className="rounded-lg border border-slate-700 bg-slate-800/40 p-3 text-center">
                <p className="text-[11px] text-slate-500">{w.weekLabel}</p>
                <p
                  className={cn(
                    "mt-1 font-heading text-xl font-semibold",
                    w.accuracy_pct >= 90 ? "text-green-400" : w.accuracy_pct >= 80 ? "text-amber-400" : "text-red-400"
                  )}
                >
                  {w.accuracy_pct}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projected vs actual — inflows and outflows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Inflows — Projected vs. Actual"
          legend={[
            { label: "Projected", color: "#2f5a92", variant: "solid" },
            { label: "Actual", color: chartColors.blue, variant: "solid" },
          ]}
        >
          <ComparisonChart rows={inflowRows} color={chartColors.blue} />
        </SectionCard>
        <SectionCard
          title="Outflows — Projected vs. Actual"
          legend={[
            { label: "Projected", color: "#3a4657", variant: "solid" },
            { label: "Actual", color: chartColors.slate500, variant: "solid" },
          ]}
        >
          <ComparisonChart rows={outflowRows} color={chartColors.slate500} />
        </SectionCard>
      </div>

      {/* Variance breakdown */}
      <SectionCard title="Variance Breakdown" subtitle="Largest driver of each week's miss">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-semibold">Week</th>
                <th className="px-3 py-2.5 font-semibold">Largest variance driver</th>
                <th className="px-3 py-2.5 text-right font-semibold">Net variance</th>
                <th className="px-3 py-2.5 text-right font-semibold">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {forecastVsActual.map((w) => {
                const positive = w.variance >= 0;
                return (
                  <tr key={w.weekStart} className="border-b border-slate-700/50 last:border-0">
                    <td className="px-3 py-3 font-medium text-slate-200">{w.weekLabel}</td>
                    <td className="px-3 py-3 text-slate-400">{w.topVarianceLabel}</td>
                    <td className={cn("px-3 py-3 text-right font-semibold tabular-nums", positive ? "text-green-400" : "text-red-400")}>
                      {positive ? "+" : "−"}
                      {formatCompactCurrency(Math.abs(w.variance))}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-slate-200">
                      {w.accuracy_pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
