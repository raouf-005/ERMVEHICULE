"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/src/components/ui/skeleton";

interface DashboardChartsProps {
  financials: { name: string; amount: number }[];
  invoiceStatus: { name: string; value: number }[];
  monthlyRevenue?: { name: string; amount: number }[];
}

const DashboardCharts = dynamic(
  () =>
    import("@/src/components/dashboard/DashboardCharts").then(
      (mod) => mod.DashboardCharts
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
  }
);

export function ChartWrapper(props: DashboardChartsProps) {
  return <DashboardCharts {...props} />;
}
