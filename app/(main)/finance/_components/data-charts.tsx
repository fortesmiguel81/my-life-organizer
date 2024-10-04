"use client";

import { DateRange } from "react-day-picker";

import { useGetFinanceSummary } from "@/features/summary/api/use-get-finance-summary";
import { formatDateRange } from "@/lib/utils";

import { CategoriesSpendingPieChart } from "./categories-spending-pie-chart";
import { TransactionsHistoryByDayChart } from "./transactions-history-by-day-chart";

type Props = {
  dateRange?: DateRange;
};

export default function DataCharts({ dateRange }: Props) {
  const { data, isLoading } = useGetFinanceSummary();

  const dateRangeLabel = formatDateRange(dateRange);

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
      <div className="col-span-1 lg:col-span-3 xl:col-span-4">
        <TransactionsHistoryByDayChart
          dateRange={dateRangeLabel}
          data={data?.days}
        />
      </div>
      <div className="col-span-1 lg:col-span-3 xl:col-span-2">
        <CategoriesSpendingPieChart
          dateRange={dateRangeLabel}
          data={data?.categories}
        />
      </div>
    </div>
  );
}
