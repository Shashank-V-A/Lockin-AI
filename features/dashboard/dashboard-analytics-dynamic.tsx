"use client";

import dynamic from "next/dynamic";
import { ChartsSkeleton } from "@/components/ui/charts-skeleton";
import type { AnalyticsData } from "@/types/index";

const DashboardAnalytics = dynamic(
  () => import("./dashboard-analytics").then((m) => m.DashboardAnalytics),
  { loading: () => <ChartsSkeleton /> },
);

interface DashboardAnalyticsDynamicProps {
  data: AnalyticsData;
}

/** Lazy-loaded analytics charts to keep initial dashboard bundle small. */
export function DashboardAnalyticsDynamic({ data }: DashboardAnalyticsDynamicProps) {
  return <DashboardAnalytics data={data} />;
}
