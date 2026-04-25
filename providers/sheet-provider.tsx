import React from "react";
import { useMountedState } from "react-use";

import EditAccountSheet from "@/features/accounts/components/edit-account-sheet";
import NewAccountSheet from "@/features/accounts/components/new-account-sheet";
import EditBudgetSheet from "@/features/budgets/components/edit-budget-sheet";
import NewBudgetSheet from "@/features/budgets/components/new-budget-sheet";
import EditCategorySheet from "@/features/categories/components/edit-category-sheet";
import NewCategorySheet from "@/features/categories/components/new-category-sheet";
import EditEventSheet from "@/features/events/components/edit-event-sheet";
import NewEventSheet from "@/features/events/components/new-event-sheet";
import EditShoppingItemSheet from "@/features/shopping/components/edit-shopping-item-sheet";
import EditShoppingListSheet from "@/features/shopping/components/edit-shopping-list-sheet";
import NewShoppingItemSheet from "@/features/shopping/components/new-shopping-item-sheet";
import NewShoppingListSheet from "@/features/shopping/components/new-shopping-list-sheet";
import EditTaskListSheet from "@/features/tasks/components/edit-task-list-sheet";
import EditTaskSheet from "@/features/tasks/components/edit-task-sheet";
import NewTaskListSheet from "@/features/tasks/components/new-task-list-sheet";
import NewTaskSheet from "@/features/tasks/components/new-task-sheet";
import EditTransactionSheet from "@/features/transactions/components/edit-transaction-sheet";
import NewTransactionSheet from "@/features/transactions/components/new-transaction-sheet";

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

      <NewEventSheet />
      <EditEventSheet />

      <NewTaskListSheet />
      <EditTaskListSheet />
      <NewTaskSheet />
      <EditTaskSheet />

      <NewShoppingListSheet />
      <EditShoppingListSheet />
      <NewShoppingItemSheet />
      <EditShoppingItemSheet />
    </>
  );
}
