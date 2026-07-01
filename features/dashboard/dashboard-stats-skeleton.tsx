import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton for dashboard stats while streaming. */
export function DashboardStatsSkeleton() {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-44 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </>
  );
}
