import { PageHeader } from "@/components/page-header";
import { ForecastView } from "@/components/forecast/forecast-view";

export default function ForecastPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Cash Flow Forecast"
        subtitle="Rolling 4-week projection, spending patterns, and forecast accuracy"
      />
      <ForecastView />
    </div>
  );
}
