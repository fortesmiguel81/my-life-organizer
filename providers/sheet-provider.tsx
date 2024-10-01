import React from "react";
import { useMountedState } from "react-use";

import EditAccountSheet from "@/features/accounts/components/edit-account-sheet";
import NewAccountSheet from "@/features/accounts/components/new-account-sheet";
import EditCategorySheet from "@/features/categories/components/edit-category-sheet";
import NewCategorySheet from "@/features/categories/components/new-category-sheet";
import EditTransactionSheet from "@/features/transactions/components/edit-transaction-sheet";
import NewTransactionSheet from "@/features/transactions/components/new-transaction-sheet";
import NewBudgetSheet from "@/features/budgets/components/new-budget-sheet";
import EditBudgetSheet from "@/features/budgets/components/edit-budget-sheet";

export default function SheetProvider() {
  const isMounted = useMountedState();

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <NewTransactionSheet />
      <EditTransactionSheet />

      <NewCategorySheet />
      <EditCategorySheet />

      <NewAccountSheet />
      <EditAccountSheet />

      <NewBudgetSheet />
      <EditBudgetSheet />
    </>
  );
}
