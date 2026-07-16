import { TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PlaceholderView } from "@/components/placeholder-view";

export default function CashFlowForecastPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Cash Flow Forecast"
        subtitle="13-week direct cash forecast with scenario planning"
      />
      <PlaceholderView
        icon={TrendingUp}
        title="13-Week Cash Flow Forecast"
        description="A rolling direct cash forecast built from AR, AP, and payroll timing — with best/base/downside scenarios. This view is being wired to demo data next."
      />
    </div>
  );
}
