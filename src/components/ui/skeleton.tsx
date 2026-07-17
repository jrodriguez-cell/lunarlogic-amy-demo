import { cn } from "@/lib/utils";

/** Pulsing placeholder block used to compose loading skeletons. */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-700/40", className)} style={style} />;
}

/** A card-shaped skeleton surface matching the brand card. */
export function SkeletonCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-slate-700 bg-slate-800/40 p-5", className)}>
      {children}
    </div>
  );
}

/** Stat-tile skeleton (label, big value, sub-line). */
export function SkeletonStat() {
  return (
    <SkeletonCard>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-3 h-3 w-20" />
    </SkeletonCard>
  );
}

/** Chart-panel skeleton (title + plot area). */
export function SkeletonChart({ height = 240 }: { height?: number }) {
  return (
    <SkeletonCard>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-1.5 h-3 w-56" />
      <Skeleton className="mt-4 w-full" style={{ height }} />
    </SkeletonCard>
  );
}
