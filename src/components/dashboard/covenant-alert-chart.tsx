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

import {
  interestCoverageSeries,
  interestCoverageThreshold,
} from "@/data/covenants";
import { chartColors, tooltipStyle, axisTick } from "@/lib/chart-theme";

const BOUNDARY = interestCoverageSeries.findIndex((p) => p.type === "projected");

const data = interestCoverageSeries.map((p, i) => {
  const isProjected = p.type === "projected";
  const isBoundary = i === BOUNDARY - 1; // last actual joins both lines
  return {
    label: p.label,
    value: p.value,
    type: p.type,
    actual: !isProjected ? p.value : null,
    projected: isProjected || isBoundary ? p.value : null,
    breach: p.value < interestCoverageThreshold,
  };
});

type Row = (typeof data)[number];

function BreachDot(props: DotProps & { payload?: Row }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return <g />;
  if (payload.breach) {
    return <circle cx={cx} cy={cy} r={5} fill={chartColors.red} stroke="#0F172A" strokeWidth={2} />;
  }
  return <circle cx={cx} cy={cy} r={3} fill={chartColors.blue} />;
}

function CovenantTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  const passes = r.value >= interestCoverageThreshold;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold text-slate-100">{r.label} 2026</div>
      <div className="mt-0.5 text-slate-300">
        Interest coverage{" "}
        <span
          className="font-semibold"
          style={{ color: passes ? chartColors.green : chartColors.red }}
        >
          {r.value.toFixed(2)}x
        </span>
      </div>
      <div className="text-[11px] text-slate-500">
        {r.type === "projected" ? "Projected" : "Actual"}
        {!passes ? " · below 2.0x floor" : ""}
      </div>
    </div>
  );
}

export function CovenantAlertChart() {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <LineChart data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="label"
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: chartColors.grid }}
          interval={0}
        />
        <YAxis
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={36}
          domain={[1.5, 4]}
          tickFormatter={(v: number) => `${v}x`}
        />

        {/* Covenant minimum — dashed red floor */}
        <ReferenceLine
          y={interestCoverageThreshold}
          stroke={chartColors.red}
          strokeDasharray="5 4"
          strokeWidth={1.5}
          label={{
            value: `Min ${interestCoverageThreshold.toFixed(1)}x`,
            position: "insideBottomRight",
            fill: chartColors.red,
            fontSize: 10,
          }}
        />
        {/* Boundary between actuals and projection */}
        <ReferenceLine
          x={data[BOUNDARY]?.label}
          stroke={chartColors.grid}
          strokeDasharray="4 4"
        />

        <Line
          dataKey="actual"
          stroke={chartColors.blue}
          strokeWidth={2}
          dot={<BreachDot />}
          connectNulls
          isAnimationActive={false}
        />
        <Line
          dataKey="projected"
          stroke={chartColors.blue}
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={<BreachDot />}
          connectNulls
          isAnimationActive={false}
        />

        <Tooltip content={<CovenantTooltip />} cursor={{ stroke: chartColors.grid }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
