"use client";

import {
  Area,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { weeklyCashFlow } from "@/data/forecast";
import { chartColors, tooltipStyle, axisTick } from "@/lib/chart-theme";
import { formatCompactCurrency } from "@/lib/utils";

const BOUNDARY = weeklyCashFlow.findIndex((w) => w.segment === "projected");

// Split net into two overlapping series so the historical span renders solid
// and the projected span renders faded/dashed, joined at the boundary week.
const data = weeklyCashFlow.map((w, i) => {
  const isProjected = w.segment === "projected";
  const isBoundary = i === BOUNDARY - 1; // last historical week connects both
  return {
    label: w.weekLabel,
    segment: w.segment,
    historicalNet: !isProjected ? w.net : null,
    projectedNet: isProjected || isBoundary ? w.net : null,
    band:
      isProjected && w.bandLow !== null && w.bandHigh !== null
        ? [w.bandLow, w.bandHigh]
        : isBoundary
          ? [w.net, w.net]
          : null,
    isCashDip: w.isCashDip,
  };
});

interface TooltipEntry {
  payload: (typeof data)[number];
}

function CashTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const net = p.historicalNet ?? p.projectedNet ?? 0;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold text-slate-100">{p.label}</div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: net >= 0 ? chartColors.green : chartColors.red }}
        />
        <span className="text-slate-300">
          Net {formatCompactCurrency(net)}
        </span>
      </div>
      <div className="mt-0.5 text-[11px] text-slate-500">
        {p.segment === "projected" ? "Projected" : "Actual"}
        {p.isCashDip ? " · audit + tax week" : ""}
      </div>
    </div>
  );
}

export function CashFlowChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="cf-hist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.35} />
            <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0.04} />
          </linearGradient>
          <linearGradient id="cf-proj" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.14} />
            <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="label"
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: chartColors.grid }}
          interval={0}
          angle={-18}
          textAnchor="end"
          height={48}
        />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v: number) => formatCompactCurrency(v)}
        />

        {/* Confidence band on the projected span (subtle shaded area) */}
        <Area
          dataKey="band"
          stroke="none"
          fill={chartColors.blue}
          fillOpacity={0.1}
          isAnimationActive={false}
          connectNulls
        />

        {/* Zero baseline — the audit-week dip crosses below it */}
        <ReferenceLine y={0} stroke={chartColors.slate500} strokeWidth={1} />

        {/* Divider marking where the forecast begins */}
        <ReferenceLine
          x={data[BOUNDARY]?.label}
          stroke={chartColors.grid}
          strokeDasharray="4 4"
          label={{
            value: "Forecast",
            position: "insideTopRight",
            fill: chartColors.slate500,
            fontSize: 10,
          }}
        />

        <Area
          dataKey="historicalNet"
          stroke={chartColors.blue}
          strokeWidth={2}
          fill="url(#cf-hist)"
          connectNulls
          isAnimationActive={false}
          dot={{ r: 3, fill: chartColors.blue, strokeWidth: 0 }}
        />
        <Area
          dataKey="projectedNet"
          stroke={chartColors.blue}
          strokeWidth={2}
          strokeDasharray="5 4"
          fill="url(#cf-proj)"
          connectNulls
          isAnimationActive={false}
          dot={{ r: 3, fill: chartColors.blue, strokeWidth: 0 }}
        />

        <Tooltip content={<CashTooltip />} cursor={{ stroke: chartColors.grid }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
