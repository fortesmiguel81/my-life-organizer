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
import { useCreateBudget } from "@/features/budgets/api/use-create-budget";
import { useNewBudget } from "@/features/budgets/hooks/use-new-budget";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

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

export default function NewBudgetSheet() {
  const { isOpen, onClose } = useNewBudget();

  const createMutation = useCreateBudget();

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

  const isPending = createMutation.isPending;

  const isLoading = categoryQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Budget</SheetTitle>
          <SheetDescription>Create a new budget</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner size="icon" />
          </div>
        ) : (
          <BudgetForm
            onSubmit={onSubmit}
            disabled={isPending}
            categoryOptions={categoryOptions}
            onCreateCategory={onCreateCategory}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
