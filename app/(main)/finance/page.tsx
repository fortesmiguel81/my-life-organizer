"use client";

import { useState } from "react";

import { subDays } from "date-fns";
import { Activity, CreditCard, DollarSign, Users, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Combobox } from "@/components/combox";
import { DateRangePicker } from "@/components/date-range-picker";
import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

import { CategorySpendingPieChart } from "./_components/categories-spending-pie-chart";
import { TransactionsHistoryByDayChart } from "./_components/transactions-history-by-day-chart";

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
            <DateRangePicker
              dateRange={dateRange}
              onChange={setDateRange}
            />
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
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscriptions
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-muted-foreground">
                  +19% from last month
                </p>
              </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-muted-foreground">
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-4 xl:grid-cols-4">
            <div className="col-span-3">
              <TransactionsHistoryByDayChart />
            </div>
            <div className="col-span-1">
              <CategorySpendingPieChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
