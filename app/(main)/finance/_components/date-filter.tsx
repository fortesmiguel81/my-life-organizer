"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { format, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import qs from "query-string";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetFinanceSummary } from "@/features/summary/api/use-get-finance-summary";
import { cn } from "@/lib/utils";
import React from "react";

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();

  const { isLoading: isLoadingFinanceSummary } = useGetFinanceSummary();
  const { isLoading: isLoadingAccounts } = useGetAccounts();

  const params = useSearchParams();
  const accountId = params.get("accountId") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const paramState = {
    from: from ? new Date(from) : defaultFrom,
    to: to ? new Date(to) : defaultTo,
  } as DateRange;

  const onChange = (newValue: DateRange) => {
    const query = {
      accountId,
      from,
      to,
    };

    if (newValue) {
      query.from = format(newValue.from!, "yyyy-MM-dd");
      query.to = format(newValue.to!, "yyyy-MM-dd");
    } else {
      query.from = "";
      query.to = "";
    }

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  const isLoading = isLoadingFinanceSummary || isLoadingAccounts;

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-[300px] justify-start bg-muted/50 text-left font-normal",
              !paramState && "text-muted-foreground"
            )}
            disabled={isLoading}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {paramState?.from ? (
              paramState.to ? (
                <>
                  {format(paramState.from, "LLL dd, y")} -{" "}
                  {format(paramState.to, "LLL dd, y")}
                </>
              ) : (
                format(paramState.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={paramState?.from}
            selected={paramState}
            onSelect={(range) => range && onChange(range)}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
