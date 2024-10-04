import { DateRange } from "react-day-picker";
import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

import { useGetFinanceSummary } from "@/features/summary/api/use-get-finance-summary";
import { formatDateRange } from "@/lib/utils";

import DataCard, { DataCardLoading } from "./data-card";

type Props = {
  dateRange?: DateRange;
};

export default function DataCardGrid({ dateRange }: Props) {
  const { data, isLoading } = useGetFinanceSummary();

  const dateRangeLabel = formatDateRange(dateRange);

  if (isLoading) {
    return (
      <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={FaPiggyBank}
        variant="default"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={FaArrowTrendUp}
        variant="success"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={FaArrowTrendDown}
        variant="danger"
        dateRange={dateRangeLabel}
      />
    </div>
  );
}
