"use client";

import {
  Area,
  Bar,
  BarChart,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { dailyForecast, minBalanceThreshold } from "@/data/forecast";
import { chartColors, tooltipStyle, axisTick } from "@/lib/chart-theme";
import { formatCompactCurrency, formatCurrency } from "@/lib/utils";

const data = dailyForecast.map((d) => ({
  label: d.label,
  balance: d.balance,
  band: [d.bandLow, d.bandHigh] as [number, number],
  inflow: d.inflow,
  outflowNeg: -d.outflow,
  outflow: d.outflow,
  net: d.net,
  events: d.events,
}));

type Row = (typeof data)[number];
const Y_WIDTH = 56;
const MARGIN = { top: 8, right: 16, bottom: 0, left: 4 };

function BalanceTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold text-slate-100">{r.label}</div>
      <div className="mt-0.5 text-slate-300">
        Balance <span className="font-semibold">{formatCurrency(r.balance)}</span>
      </div>
      {r.events.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-[11px] text-slate-400">
          {r.events.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FlowTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold text-slate-100">{r.label}</div>
      <div className="mt-0.5 flex items-center gap-1.5 text-slate-300">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.blue }} />
        In {formatCompactCurrency(r.inflow)}
      </div>
      <div className="flex items-center gap-1.5 text-slate-300">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.slate500 }} />
        Out {formatCompactCurrency(r.outflow)}
      </div>
      <div className="mt-0.5 text-[11px] text-slate-500">
        Net {formatCompactCurrency(r.net)}
      </div>
    </div>
  );
}

export function DailyCashChart() {
  return (
    <div className="space-y-1">
      {/* Panel A — net cash position with confidence band + min threshold */}
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={MARGIN}>
          <defs>
            <linearGradient id="balance-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#818CF8" />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={false} axisLine={{ stroke: chartColors.grid }} height={4} />
          <YAxis
            width={Y_WIDTH}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            domain={[0, 360000]}
            ticks={[0, 100000, 200000, 300000]}
            allowDataOverflow
            tickFormatter={(v: number) => formatCompactCurrency(v)}
          />
          <Area
            dataKey="band"
            stroke="none"
            fill={chartColors.blue}
            fillOpacity={0.1}
            isAnimationActive={false}
          />
          <ReferenceLine
            y={minBalanceThreshold}
            stroke={chartColors.amber}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: `Min balance ${formatCompactCurrency(minBalanceThreshold)}`,
              position: "insideBottomLeft",
              fill: chartColors.amber,
              fontSize: 10,
            }}
          />
          <Line
            dataKey="balance"
            stroke="url(#balance-stroke)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip content={<BalanceTooltip />} cursor={{ stroke: chartColors.grid }} />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Panel B — daily inflows (up) and outflows (down), shared x-axis */}
      <ResponsiveContainer width="100%" height={132}>
        <BarChart data={data} margin={{ ...MARGIN, top: 4, bottom: 4 }} barGap={-6} stackOffset="sign">
          <XAxis
            dataKey="label"
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid }}
            interval={2}
            angle={-24}
            textAnchor="end"
            height={40}
          />
          <YAxis
            width={Y_WIDTH}
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            domain={[-90000, 60000]}
            ticks={[-90000, -45000, 0, 45000]}
            allowDataOverflow
            tickFormatter={(v: number) => formatCompactCurrency(v)}
          />
          <ReferenceLine y={0} stroke={chartColors.slate500} strokeWidth={1} />
          <Bar dataKey="inflow" fill={chartColors.blue} radius={[2, 2, 0, 0]} isAnimationActive={false} maxBarSize={16} />
          <Bar dataKey="outflowNeg" fill={chartColors.slate500} radius={[0, 0, 2, 2]} isAnimationActive={false} maxBarSize={16} />
          <Tooltip content={<FlowTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
