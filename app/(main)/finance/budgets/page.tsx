"use client";

import { useEffect, useRef, useState } from "react";

import { File, PlusCircle, X } from "lucide-react";
import { toast } from "sonner";

import PageTitle from "@/components/page-title";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetBudgets } from "@/features/budgets/api/use-get-budgets";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { exportBudgetsToCSV } from "@/lib/export";

import BudgetCard from "./_components/budget-card";

export default function BudgetsPage() {
  const budgetsQuery = useGetBudgets();
  const budgets = budgetsQuery.data || [];

  const [globalFilter, setGlobalFilter] = useState("");
  const newBudget = useNewBudget();
  const notifiedRef = useRef(false);

  // Show toast alerts when budgets are at or near their limit
  useEffect(() => {
    if (!budgetsQuery.isSuccess || notifiedRef.current) return;
    notifiedRef.current = true;

    budgets.forEach((budget) => {
      if (budget.amount <= 0) return;
      const pct = (budget.amountSpent / budget.amount) * 100;
      if (pct >= 100) {
        toast.error(
          `"${budget.category}" budget exceeded — ${pct.toFixed(0)}% used`
        );
      } else if (pct >= 80) {
        toast.warning(
          `"${budget.category}" budget at ${pct.toFixed(0)}% — running low`
        );
      }
    });
  }, [budgetsQuery.isSuccess, budgets]);

  const isLoading = budgetsQuery.isLoading;

  const filteredBudgets = budgets.filter((budget) =>
    budget.category.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle title="Budgets" subTitle="Manage your budgets" />
      {isLoading ? (
        <div className="flex w-full items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="mt-3 flex flex-col justify-between gap-4 md:h-9 md:flex-row lg:h-9 lg:flex-row">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Filter budgets..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="h-9 max-w-sm bg-muted/50"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  className="font-md h-9 px-3 py-0"
                  onClick={() => setGlobalFilter("")}
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="font-md h-9 w-full bg-muted/50 md:w-auto lg:w-auto"
                onClick={() => exportBudgetsToCSV(budgets)}
                disabled={budgets.length === 0}
              >
                <File className="mr-2 h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                className="font-md h-9 w-full md:w-auto lg:w-auto"
                onClick={newBudget.onOpen}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Budget</span>
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredBudgets.length > 0 ? (
              filteredBudgets.map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))
            ) : (
              <p className="col-span-3 p-10 text-center text-gray-500">
                No budgets found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
