"use client";

import { CircleCheck, TriangleAlert, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { covenantColors } from "@/lib/chart-theme";
import {
  scenarioLimits,
  interestCoverageThreshold,
  type ScenarioResult,
} from "@/data/covenants";

function Slider({
  label,
  value,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-slate-300">{label}</label>
        <span className="font-heading text-lg font-semibold text-slate-100 tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[#3B82F6]"
        aria-label={label}
      />
      <div className="mt-0.5 flex justify-between text-[10px] text-slate-500">
        <span>0{suffix}</span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export function WhatIfPanel({
  dsoDays,
  revPct,
  onDso,
  onRev,
  result,
}: {
  dsoDays: number;
  revPct: number;
  onDso: (v: number) => void;
  onRev: (v: number) => void;
  result: ScenarioResult;
}) {
  const { projectedInterestCoverage: sep, baselineInterestCoverage: base, breachAverted } = result;
  const active = dsoDays > 0 || revPct > 0;
  const icColor = covenantColors.interest_coverage;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Sliders */}
      <div className="space-y-6">
        <Slider
          label="If DSO improves by"
          value={dsoDays}
          max={scenarioLimits.dsoDaysMax}
          suffix=" days"
          onChange={onDso}
        />
        <Slider
          label="If monthly revenue increases by"
          value={revPct}
          max={scenarioLimits.revenuePctMax}
          suffix="%"
          onChange={onRev}
        />
        <div className="flex items-start gap-2 rounded-lg border border-blue-400/20 bg-blue-400/[0.06] px-3 py-2.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
          <p className="text-xs leading-relaxed text-slate-400">
            Faster collections shrink DSO and free cash to pay down the revolver —
            lifting interest coverage. Accelerating AR is exactly what LunarLogic
            automates.
          </p>
        </div>
      </div>

      {/* Live readout */}
      <div className="flex flex-col justify-center rounded-xl border border-slate-700 bg-slate-900/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Projected Sept interest coverage
        </p>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="font-heading text-4xl font-semibold tabular-nums" style={{ color: icColor }}>
            {sep.toFixed(2)}x
          </span>
          {active && (
            <span className="text-sm text-slate-500 tabular-nums">
              from {base.toFixed(2)}x
            </span>
          )}
        </div>

        <div
          className={cn(
            "mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5",
            breachAverted
              ? "border-green-400/20 bg-green-400/10"
              : "border-amber-400/20 bg-amber-400/10"
          )}
        >
          {breachAverted ? (
            <CircleCheck className="h-4 w-4 shrink-0 text-green-400" />
          ) : (
            <TriangleAlert className="h-4 w-4 shrink-0 text-amber-400" />
          )}
          <p className={cn("text-sm font-medium", breachAverted ? "text-green-300" : "text-amber-200")}>
            {breachAverted
              ? `Above the ${interestCoverageThreshold.toFixed(1)}x floor — covenant breach averted`
              : `Below the ${interestCoverageThreshold.toFixed(1)}x floor — breach projected in September`}
          </p>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          The projected lines above update live as you adjust the levers.
        </p>
      </div>
    </div>
  );
}
