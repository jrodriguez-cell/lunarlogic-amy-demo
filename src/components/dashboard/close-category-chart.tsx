"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { closeByCategory } from "@/data/close-checklist";
import { chartColors, tooltipStyle, axisTick } from "@/lib/chart-theme";

const data = closeByCategory.map((c) => ({
  label: c.label,
  completed: c.completed,
  remaining: c.remaining,
  total: c.total,
}));

interface Row {
  label: string;
  completed: number;
  remaining: number;
  total: number;
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <div className="font-semibold text-slate-100">{r.label}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.green }} />
        <span className="text-slate-300">{r.completed} complete</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: chartColors.slate600 }} />
        <span className="text-slate-300">{r.remaining} remaining</span>
      </div>
    </div>
  );
}

export function CloseCategoryChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 4, right: 16, bottom: 0, left: 8 }}
        barCategoryGap={6}
      >
        <XAxis
          type="number"
          allowDecimals={false}
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: chartColors.grid }}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={axisTick}
          tickLine={false}
          axisLine={false}
          width={128}
        />
        <Tooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />

        <Bar dataKey="completed" stackId="s" fill={chartColors.green} radius={[4, 0, 0, 4]} isAnimationActive={false}>
          <LabelList
            dataKey="completed"
            position="insideLeft"
            fill="#0F172A"
            fontSize={11}
            fontWeight={700}
            formatter={(v: number) => (v > 0 ? v : "")}
          />
        </Bar>
        <Bar dataKey="remaining" stackId="s" fill={chartColors.slate600} radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {data.map((d, i) => (
            // Fully-complete categories get a rounded left+right on the green bar;
            // suppress the empty grey segment's stroke seam.
            <Cell key={i} fillOpacity={d.remaining === 0 ? 0 : 1} />
          ))}
          <LabelList
            dataKey="remaining"
            position="insideRight"
            fill={chartColors.slate400}
            fontSize={11}
            fontWeight={700}
            formatter={(v: number) => (v > 0 ? v : "")}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
