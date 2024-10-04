"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { X } from "lucide-react";
import qs from "query-string";

import PageTitle from "@/components/page-title";
import { Button } from "@/components/ui/button";

import { AccountFilter } from "./_components/account-filter";
import DataCardGrid from "./_components/data-card-grid";
import DataCharts from "./_components/data-charts";
import { DateFilter } from "./_components/date-filter";

export default function FinanceDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const accountId = params.get("accountId") || "";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const canResetFilters = accountId || from || to;

  const handleResetFilters = () => {
    const query = {
      accountId: "",
      from: "",
      to: "",
    };

    const url = qs.stringifyUrl(
      {
        url: pathname,
        query,
      },
      { skipNull: true, skipEmptyString: true }
    );

    router.push(url);
  };

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle title="Finance Dashboard" subTitle="View you financial data" />
      <div className="flex flex-col">
        <div className="mt-3 flex flex-col justify-between gap-4 md:h-9 md:flex-row lg:h-9 lg:flex-row">
          <div className="flex flex-1 items-center space-x-2">
            <AccountFilter />
            <DateFilter />
            {canResetFilters && (
              <Button
                variant="ghost"
                className="font-md h-9 px-3 py-0"
                onClick={handleResetFilters}
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <DataCardGrid />
          <DataCharts />
        </div>
      </div>
    </div>
  );
}
