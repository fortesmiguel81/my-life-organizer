import React from "react";
import { z } from "zod";

import Spinner from "@/components/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertBudgetSchema } from "@/db/schema";
import { useDeleteBudget } from "@/features/budgets/api/use-delete-budget";
import { useEditBudget } from "@/features/budgets/api/use-edit-budget";
import { useGetBudget } from "@/features/budgets/api/use-get-budget";
import { useOpenBudget } from "@/features/budgets/hooks/use-open-budget";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useConfirm } from "@/hooks/use-confirm";

import BudgetForm from "./budget-form";

const formSchema = insertBudgetSchema.omit({
  id: true,
  userId: true,
  orgId: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

type FormValues = z.input<typeof formSchema>;

export default function EditBudgetSheet() {
  const { isOpen, onClose, id } = useOpenBudget();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action cannot be undone. This will permanently delete the budget."
  );

  const budgetQuery = useGetBudget(id);
  const editMutation = useEditBudget(id);
  const deleteMutation = useDeleteBudget(id);

  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const onCreateCategory = (name: string) => {
    categoryMutation.mutate({ name });
  };

  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
    prop: category.icon ?? "",
  }));

  const isPending =
    editMutation.isPending || deleteMutation.isPending || budgetQuery.isPending;

  const isLoading = budgetQuery.isLoading || categoryQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const defaultValues = budgetQuery.data
    ? {
        ...budgetQuery.data,
        amount: budgetQuery.data.amount.toString(),
      }
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Budget</SheetTitle>
            <SheetDescription>Edit the details of the budget</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="icon" />
            </div>
          ) : (
            <BudgetForm
              id={id}
              onSubmit={onSubmit}
              disabled={isPending}
              onDelete={onDelete}
              defaultValues={defaultValues}
              categoryOptions={categoryOptions}
              onCreateCategory={onCreateCategory}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
