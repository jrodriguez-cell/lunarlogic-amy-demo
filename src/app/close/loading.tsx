import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function CloseLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-96 max-w-full" />

      <div className="mt-6 space-y-6">
        {/* status bar */}
        <SkeletonCard>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="mt-4 h-9 w-full max-w-md rounded-lg" />
        </SkeletonCard>

        {/* category sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-5/6" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
