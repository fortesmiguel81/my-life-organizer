"use client";

import { useState } from "react";

import { subDays } from "date-fns";
import { X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Combobox } from "@/components/combox";
import { DateRangePicker } from "@/components/date-range-picker";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

import DataCardGrid from "./_components/data-card-grid";
import DataCharts from "./_components/data-charts";

export default function FinanceDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [accountFilter, setAccountFilter] = useState(
    "" as string | null | undefined
  );

  const accountQuery = useGetAccounts();
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
    prop: "",
  }));

  const isLoading = accountQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle title="Finance Dashboard" subTitle="View you financial data" />
      <div className="flex flex-col">
        <div className="mt-3 flex flex-col justify-between gap-4 md:h-9 md:flex-row lg:h-9 lg:flex-row">
          <div className="flex flex-1 items-center space-x-2">
            <Combobox
              value={accountFilter}
              options={accountOptions}
              onChange={setAccountFilter}
              searchFor="account"
              disabled={isLoading}
            />
            <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
            {(dateRange || accountFilter) && (
              <Button
                variant="ghost"
                className="font-md h-9 px-3 py-0"
                onClick={() => {
                  setAccountFilter("");
                }}
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <DataCardGrid dateRange={dateRange} />
          <DataCharts dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
}
