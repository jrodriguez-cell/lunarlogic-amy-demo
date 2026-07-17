import { TriangleAlert, ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/dashboard/section-card";
import { DailyCashChart } from "@/components/forecast/daily-cash-chart";
import { chartColors } from "@/lib/chart-theme";
import { cn, formatCompactCurrency } from "@/lib/utils";
import { forecastWeeks } from "@/data/forecast";

const AUDIT_FEE = 22000;

export function ForecastTab() {
  const dipWeek = forecastWeeks.find((w) => w.isCashDip);

  return (
    <div className="space-y-6">
      <SectionCard
        title="4-Week Daily Cash Projection"
        subtitle="Rolling daily forecast · net position, confidence band, and daily flows"
        legend={[
          { label: "Net position", color: chartColors.blue, variant: "solid" },
          { label: "Confidence band", color: "#2b4a72", variant: "solid" },
          { label: "Inflows", color: chartColors.blue, variant: "solid" },
          { label: "Outflows", color: chartColors.slate500, variant: "solid" },
          { label: "Min balance", color: chartColors.amber, variant: "dashed" },
        ]}
      >
        {dipWeek && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2.5">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-200">
              <span className="font-semibold">
                Annual audit fee ({formatCompactCurrency(AUDIT_FEE)}) projected{" "}
                {dipWeek.weekLabel}
              </span>{" "}
              — flagged as high-confidence annual recurring. Stacked with
              contractor payroll and the Q1 estimated tax payment, it drives the
              projected cash dip; the balance stays well above the $50K floor.
            </p>
          </div>
        )}
        <DailyCashChart />
      </SectionCard>

      <div>
        <h3 className="mb-3 font-heading text-base font-semibold text-slate-200">
          Weekly Summary
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {forecastWeeks.map((w) => {
            const net = w.projected_inflows - w.projected_outflows;
            const positive = net >= 0;
            return (
              <Card
                key={w.weekStart}
                className={cn(w.isCashDip && "border-amber-400/40 bg-amber-400/[0.04]")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-200">{w.weekLabel}</span>
                    {w.isCashDip && (
                      <span className="rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-400">
                        Audit wk
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Inflows</span>
                      <span className="font-semibold text-blue-300 tabular-nums">
                        {formatCompactCurrency(w.projected_inflows)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Outflows</span>
                      <span className="font-semibold text-slate-400 tabular-nums">
                        {formatCompactCurrency(w.projected_outflows)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-700/60 pt-1.5">
                      <span className="text-slate-500">Net</span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 font-heading font-semibold tabular-nums",
                          positive ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {formatCompactCurrency(net)}
                      </span>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1 border-t border-slate-700/60 pt-2.5">
                    {w.drivers.map((d) => (
                      <li key={d} className="flex gap-1.5 text-[11px] leading-snug text-slate-500">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
