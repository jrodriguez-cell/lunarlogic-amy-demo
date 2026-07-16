import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { headlineMetrics, type Sentiment } from "@/data/dashboard";
import { cn } from "@/lib/utils";

const sentimentColor: Record<Sentiment, string> = {
  positive: "text-green-400",
  negative: "text-red-400",
  neutral: "text-amber-400",
};

function DeltaIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Treasury Dashboard"
        subtitle="Working-capital and liquidity snapshot for Vanguard Holdings Group"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {headlineMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <p className="mt-2 font-heading text-3xl font-semibold text-slate-100">
                {metric.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold",
                    sentimentColor[metric.sentiment]
                  )}
                >
                  <DeltaIcon trend={metric.trend} />
                  {metric.delta}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{metric.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h2 className="font-heading text-lg font-semibold text-slate-100">
            Welcome to the LunarLogic demo
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            This environment showcases how LunarLogic turns QuickBooks and Slack
            activity into a live finance cockpit for Vanguard Holdings Group. Use
            the sidebar to explore the 13-week cash flow forecast, the month-end
            close workbook, and the debt covenant monitor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
