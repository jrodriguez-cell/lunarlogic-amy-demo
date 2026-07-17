import { Skeleton, SkeletonCard, SkeletonChart } from "@/components/ui/skeleton";

export default function ForecastLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      <Skeleton className="mt-6 h-10 w-64 rounded-lg" />
      <div className="mt-6 space-y-6">
        <SkeletonChart height={360} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </SkeletonCard>
          ))}
        </div>
      </div>
    </div>
  );
}
