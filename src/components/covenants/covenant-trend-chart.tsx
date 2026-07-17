"use client";

import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotProps,
} from "recharts";

import { chartColors, covenantColors, tooltipStyle, axisTick } from "@/lib/chart-theme";
import { covenantDefinitions, type ScenarioPoint } from "@/data/covenants";

const IC_THRESHOLD = 2.0;
const thresholds = Object.fromEntries(
  covenantDefinitions.map((d) => [d.key, d.threshold])
);

export function CovenantTrendChart({ points }: { points: ScenarioPoint[] }) {
  const boundary = points.findIndex((p) => p.type === "projected") - 1;

  const data = points.map((p, i) => {
    const proj = p.type === "projected";
    const edge = i === boundary;
    return {
      label: p.label,
      type: p.type,
      cr: p.current_ratio,
      de: p.debt_to_equity,
      ic: p.interest_coverage,
      cr_a: !proj ? p.current_ratio : null,
      cr_p: proj || edge ? p.current_ratio : null,
      de_a: !proj ? p.debt_to_equity : null,
      de_p: proj || edge ? p.debt_to_equity : null,
      ic_a: !proj ? p.interest_coverage : null,
      ic_p: proj || edge ? p.interest_coverage : null,
    };
  });

  type Row = (typeof data)[number];

  const IcDot = (props: DotProps & { payload?: Row }) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload || payload.ic_p == null) return <g />;
    const breach = payload.type === "projected" && payload.ic < IC_THRESHOLD;
    return breach ? (
      <circle cx={cx} cy={cy} r={5} fill={chartColors.red} stroke="#0F172A" strokeWidth={2} />
    ) : (
      <circle cx={cx} cy={cy} r={3} fill={covenantColors.interest_coverage} />
    );
  };

  function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
    if (!active || !payload?.length) return null;
    const r = payload[0].payload;
    const rows = [
      { key: "current_ratio", label: "Current Ratio", val: r.cr, color: covenantColors.current_ratio, op: ">=" },
      { key: "debt_to_equity", label: "Debt-to-Equity", val: r.de, color: covenantColors.debt_to_equity, op: "<=" },
      { key: "interest_coverage", label: "Interest Coverage", val: r.ic, color: covenantColors.interest_coverage, op: ">=" },
    ];
    return (
      <div style={tooltipStyle} className="px-3 py-2">
        <div className="mb-1 font-semibold text-slate-100">
          {r.label} 2026 <span className="text-slate-500">· {r.type === "projected" ? "projected" : "actual"}</span>
        </div>
        {rows.map((row) => {
          const t = thresholds[row.key];
          const pass = row.op === ">=" ? row.val >= t : row.val <= t;
          return (
            <div key={row.key} className="flex items-center gap-1.5 text-slate-300">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
              {row.label}
              <span className={`ml-auto font-semibold tabular-nums ${pass ? "text-slate-200" : "text-red-400"}`}>
                {row.val.toFixed(2)}x
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const thresholdLine = (key: string, label: string) => (
    <ReferenceLine
      y={thresholds[key]}
      stroke={covenantColors[key]}
      strokeDasharray="4 4"
      strokeOpacity={0.55}
      strokeWidth={1.25}
      label={{
        value: label,
        position: "insideTopLeft",
        fill: covenantColors[key],
        fontSize: 9,
        offset: 4,
      }}
    />
  );

  const pair = (aKey: keyof Row, pKey: keyof Row, color: string, dot: boolean, customDot?: DotProps) => (
    <>
      <Line dataKey={aKey as string} stroke={color} strokeWidth={2} dot={dot ? { r: 3, fill: color } : false} connectNulls isAnimationActive={false} />
      <Line dataKey={pKey as string} stroke={color} strokeWidth={2} strokeDasharray="2 3" dot={customDot ?? (dot ? { r: 3, fill: color } : false)} connectNulls isAnimationActive={false} />
    </>
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 24 }}>
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: chartColors.grid }} interval={0} />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={36}
          domain={[1, 3.6]}
          ticks={[1.5, 2, 2.5, 3, 3.5]}
          tickFormatter={(v: number) => `${v}x`}
        />

        {thresholdLine("interest_coverage", "IC min 2.0x")}
        {thresholdLine("current_ratio", "CR min 1.5x")}
        {thresholdLine("debt_to_equity", "D/E max 3.0x")}

        {/* boundary between actuals and projection */}
        <ReferenceLine x={data[boundary + 1]?.label} stroke={chartColors.grid} strokeDasharray="4 4" />

        {pair("cr_a", "cr_p", covenantColors.current_ratio, true)}
        {pair("de_a", "de_p", covenantColors.debt_to_equity, true)}
        <Line dataKey="ic_a" stroke={covenantColors.interest_coverage} strokeWidth={2.5} dot={{ r: 3, fill: covenantColors.interest_coverage }} connectNulls isAnimationActive={false} />
        <Line dataKey="ic_p" stroke={covenantColors.interest_coverage} strokeWidth={2.5} strokeDasharray="2 3" dot={<IcDot />} connectNulls isAnimationActive={false} />

        <Tooltip content={<TrendTooltip />} cursor={{ stroke: chartColors.grid }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
