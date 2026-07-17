import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { SectionCard } from "@/components/dashboard/section-card";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CloseCategoryChart } from "@/components/dashboard/close-category-chart";
import { CovenantAlertChart } from "@/components/dashboard/covenant-alert-chart";
import { NeedsReviewPanel } from "@/components/dashboard/needs-review-panel";
import { chartColors } from "@/lib/chart-theme";

import { forecastAccuracy } from "@/data/forecast";
import { closeSummary } from "@/data/close-checklist";
import { covenantHealth } from "@/data/covenants";

export default function DashboardPage() {
  const reviewCount = closeSummary.total - closeSummary.autoCompleted;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Treasury Dashboard"
        subtitle="Working-capital, cash, and covenant health for Vanguard Digital LLC"
      />

      {/* Top row — stat cards */}
      <StatCards />

      {/* Middle row — cash flow + close completion */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Cash Flow"
          subtitle="8-week net movement — 4 actual, 4 projected"
          legend={[
            { label: "Actual", color: chartColors.blue, variant: "solid" },
            { label: "Projected", color: chartColors.blue, variant: "dashed" },
            { label: "Confidence band", color: "#2b4a72", variant: "solid" },
          ]}
        >
          <CashFlowChart />
        </SectionCard>

        <SectionCard
          title="Close Completion by Category"
          subtitle={`${closeSummary.autoCompleted} of ${closeSummary.total} items auto-completed`}
          legend={[
            { label: "Complete", color: chartColors.green, variant: "solid" },
            { label: "Remaining", color: chartColors.slate600, variant: "solid" },
          ]}
        >
          <CloseCategoryChart />
        </SectionCard>
      </div>

      {/* Bottom row — needs review + covenant alert */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Needs Your Review"
          subtitle={`${reviewCount} close items require a human decision`}
          action={
            <Link
              href="/close"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Open workbook
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <NeedsReviewPanel />
        </SectionCard>

        <SectionCard
          title="Covenant Alert"
          subtitle="Interest coverage vs. the 2.0x facility floor"
          legend={[
            { label: "Actual", color: chartColors.blue, variant: "solid" },
            { label: "Projected", color: chartColors.blue, variant: "dashed" },
            { label: "Covenant floor", color: chartColors.red, variant: "dashed" },
          ]}
        >
          {covenantHealth.breachValue != null && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-200">
                Interest coverage is projected to fall to{" "}
                <span className="font-semibold">
                  {covenantHealth.breachValue.toFixed(1)}x
                </span>{" "}
                in August — below the {covenantHealth.threshold.toFixed(1)}x floor.
                Crossing shown below.
              </p>
            </div>
          )}
          <CovenantAlertChart />
        </SectionCard>
      </div>

      <p className="pb-2 text-center text-xs text-slate-600">
        Cash forecast accuracy {forecastAccuracy.accuracy_pct}% over the trailing{" "}
        {forecastAccuracy.trailingWeeks} weeks · demo data, no live QuickBooks
        connection
      </p>
    </div>
  );
}
