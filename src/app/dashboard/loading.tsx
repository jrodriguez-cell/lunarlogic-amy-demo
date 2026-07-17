import { Skeleton, SkeletonStat, SkeletonChart } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonChart height={280} />
        <SkeletonChart height={280} />
      </div>
    </div>
  );
}
