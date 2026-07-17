"use client";

import { useMemo, useState } from "react";

import { SectionCard } from "@/components/dashboard/section-card";
import { CovenantCard } from "@/components/covenants/covenant-card";
import { CovenantTrendChart } from "@/components/covenants/covenant-trend-chart";
import { WhatIfPanel } from "@/components/covenants/what-if-panel";
import { covenantColors } from "@/lib/chart-theme";
import { covenantStatuses, projectScenario } from "@/data/covenants";

export function CovenantView() {
  const [dsoDays, setDsoDays] = useState(0);
  const [revPct, setRevPct] = useState(0);

  const scenario = useMemo(() => projectScenario(dsoDays, revPct), [dsoDays, revPct]);

  return (
    <div className="space-y-6">
      {/* Three covenant cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {covenantStatuses.map((s) => (
          <CovenantCard key={s.key} status={s} />
        ))}
      </div>

      {/* Trend chart */}
      <SectionCard
        title="Covenant Trend"
        subtitle="Six months actual + three projected · thresholds shown as dashed lines"
        legend={[
          { label: "Current Ratio", color: covenantColors.current_ratio, variant: "solid" },
          { label: "Debt-to-Equity", color: covenantColors.debt_to_equity, variant: "solid" },
          { label: "Interest Coverage", color: covenantColors.interest_coverage, variant: "solid" },
          { label: "Projected", color: "#94A3B8", variant: "dashed" },
        ]}
      >
        <CovenantTrendChart points={scenario.points} />
      </SectionCard>

      {/* What-if scenarios */}
      <SectionCard
        title="What-If Scenarios"
        subtitle="Model how faster AR collection and revenue growth reshape the projected path"
      >
        <WhatIfPanel
          dsoDays={dsoDays}
          revPct={revPct}
          onDso={setDsoDays}
          onRev={setRevPct}
          result={scenario}
        />
      </SectionCard>
    </div>
  );
}
