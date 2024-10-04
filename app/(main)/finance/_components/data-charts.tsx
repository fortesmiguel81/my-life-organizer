"use client";

import { useGetFinanceSummary } from "@/features/summary/api/use-get-finance-summary";

import { HistoryBarChart, HistoryBarChartLoading } from "./history-bar-chart";
import { SpendingPieChart, SpendingPieLoading } from "./spending-pie-chart";

export default function DataCharts() {
  const { data, isLoading } = useGetFinanceSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
        <div className="col-span-1 lg:col-span-3 xl:col-span-4">
          <HistoryBarChartLoading />
        </div>
        <div className="col-span-1 lg:col-span-3 xl:col-span-2">
          <SpendingPieLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
      <div className="col-span-1 lg:col-span-3 xl:col-span-4">
        <HistoryBarChart data={data?.days} />
      </div>
      <div className="col-span-1 lg:col-span-3 xl:col-span-2">
        <SpendingPieChart data={data?.categories} />
      </div>
    </div>
  );
}
