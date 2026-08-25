"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";

import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import Spinner from "@/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateRange } from "@/lib/utils";

type Props = {
  data?: {
    date: string;
    income: number;
    expenses: number;
  }[];
};

const chartConfig = {
  amount: {
    label: "Amount",
  },
  income: {
    label: "Income",
    color: "hsl(var(--chart-6))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

export function HistoryBarChart({ data = [] }: Props) {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  } as DateRange;

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("income");

  const total = React.useMemo(
    () => ({
      income: data.reduce((acc, curr) => acc + curr.income, 0),
      expenses: data.reduce((acc, curr) => acc + curr.expenses, 0),
    }),
    [data]
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Transactions History</CardTitle>
          <CardDescription>{formatDateRange(paramState)}</CardDescription>
        </div>
        <div className="flex">
          {["income", "expenses"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {formatCurrency(total[key as keyof typeof total])}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="amount"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export const HistoryBarChartLoading = () => {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between space-y-2 lg:flex-row lg:items-center lg:space-y-0">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-full lg:w-[120px]" />
      </CardHeader>
      <CardContent>
        <div className="flex h-[350px] w-full flex-col items-center justify-center gap-y-4">
          <Spinner size="giant" />
        </div>
      </CardContent>
    </Card>
  );
};
