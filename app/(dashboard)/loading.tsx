import { Skeleton } from "@/components/ui/skeleton";

/** Shared loading skeleton for dashboard routes. */
export default function DashboardGroupLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 lg:grid-cols-4">
        <Skeleton className="h-44 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
