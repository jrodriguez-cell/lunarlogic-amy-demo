import { PageHeader } from "@/components/page-header";
import { CovenantView } from "@/components/covenants/covenant-view";

export default function CovenantsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Covenant Monitor"
        subtitle="Maintenance covenants on the First Meridian Bank term loan — status, trend, and scenarios"
      />
      <CovenantView />
    </div>
  );
}
