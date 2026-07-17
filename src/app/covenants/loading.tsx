import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";

export default function CovenantsLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <Skeleton className="h-8 w-60" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i}>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="mt-4 h-10 w-24" />
              <Skeleton className="mt-4 h-2 w-full rounded-full" />
            </SkeletonCard>
          ))}
        </div>
        <SkeletonChart height={300} />
        <SkeletonChart height={200} />
      </div>
    </div>
  );
}
