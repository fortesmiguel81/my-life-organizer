import { FaPiggyBank } from "react-icons/fa";
import { FaArrowTrendDown, FaArrowTrendUp } from "react-icons/fa6";

import { useGetFinanceSummary } from "@/features/summary/api/use-get-finance-summary";

import DataCard, { DataCardLoading } from "./data-card";

export default function DataCardGrid() {
  const { data, isLoading } = useGetFinanceSummary();

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
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={FaArrowTrendUp}
        variant="success"
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={FaArrowTrendDown}
        variant="danger"
      />
    </div>
  );
}
