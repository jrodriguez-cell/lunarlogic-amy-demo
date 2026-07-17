import { ArrowUpRight, ArrowDownRight, Minus, TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { covenantColors } from "@/lib/chart-theme";
import type { CovenantStatus, CovenantState } from "@/data/covenants";

const stateMeta: Record<CovenantState, { label: string; dot: string; text: string; border: string }> = {
  compliant: { label: "Compliant", dot: "bg-green-400", text: "text-green-400", border: "border-green-400/20" },
  watch: { label: "Watch", dot: "bg-amber-400", text: "text-amber-400", border: "border-amber-400/20" },
  breach: { label: "Breach", dot: "bg-red-400", text: "text-red-400", border: "border-red-400/20" },
};

function TrendBadge({ direction, label }: { direction: "up" | "down" | "flat"; label: string }) {
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/** Horizontal gauge: threshold marker + current value on a shared scale. */
function Gauge({ status }: { status: CovenantStatus }) {
  const color = covenantColors[status.key];
  const isMin = status.operator === ">=";
  // Scale so the threshold sits mid-ish and the value has room either side.
  const max = isMin ? status.threshold * 2 : status.threshold * 1.4;
  const pct = (v: number) => `${Math.min(Math.max((v / max) * 100, 0), 100)}%`;

  return (
    <div className="mt-4">
      <div className="relative h-2 rounded-full bg-slate-700/70">
        {/* value fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: pct(status.latestActual), backgroundColor: color, opacity: 0.55 }}
        />
        {/* threshold marker */}
        <div
          className="absolute inset-y-[-3px] w-0.5 bg-slate-300"
          style={{ left: pct(status.threshold) }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
        <span>
          Covenant {isMin ? "min" : "max"}{" "}
          <span className="font-semibold text-slate-400">
            {status.threshold.toFixed(2)}
            {status.unit}
          </span>
        </span>
        <span>
          Headroom{" "}
          <span className={cn("font-semibold", stateMeta[status.state].text)}>
            {status.headroomPct.toFixed(1)}%
          </span>
        </span>
      </div>
    </div>
  );
}

export function CovenantCard({ status }: { status: CovenantStatus }) {
  const meta = stateMeta[status.state];
  const color = covenantColors[status.key];

  return (
    <Card className={cn("flex flex-col", status.state === "watch" && "border-amber-400/30")}>
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
              <h3 className="font-heading text-base font-semibold text-slate-100">{status.label}</h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{status.formula}</p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
              meta.border,
              meta.text
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
            {meta.label}
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-heading text-4xl font-semibold text-slate-100 tabular-nums">
            {status.latestActual.toFixed(2)}
            <span className="text-2xl text-slate-500">{status.unit}</span>
          </span>
          <TrendBadge direction={status.trend.direction} label={status.trend.label} />
        </div>

        <Gauge status={status} />

        {status.alert && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-200">{status.alert}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
