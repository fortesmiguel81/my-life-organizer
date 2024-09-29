import * as LucideIcons from "lucide-react";
import { z } from "zod";

import Spinner from "@/components/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertCategorySchema } from "@/db/schema";
import { useDeleteCategory } from "@/features/categories/api/use-delete-category";
import { useEditCategory } from "@/features/categories/api/use-edit-category";
import { useGetCategory } from "@/features/categories/api/use-get-category";
import { useOpenCategory } from "@/features/categories/hooks/use-open-category";
import { useConfirm } from "@/hooks/use-confirm";
import { getFilteredIconDisplayNames } from "@/lib/icons";

import CategoryForm from "./category-form";

const formSchema = insertCategorySchema.omit({
  id: true,
  userId: true,
  orgId: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

type FormValues = z.input<typeof formSchema>;

export default function EditCategorySheet() {
  const { isOpen, onClose, id } = useOpenCategory();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This action cannot be undone. This will permanently delete the category."
  );

  const iconOptions = getFilteredIconDisplayNames(LucideIcons);

  const categoryQuery = useGetCategory(id);
  const editMutation = useEditCategory(id);
  const deleteMutation = useDeleteCategory(id);

  const isPending =
    editMutation.isPending ||
    deleteMutation.isPending ||
    categoryQuery.isPending;

  const isLoading = categoryQuery.isLoading;

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

  const defaultValues = categoryQuery.data
    ? {
        ...categoryQuery.data,
        icon: categoryQuery.data.icon ?? "",
        description: categoryQuery.data.description ?? undefined,
      }
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Edit the details of the category
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="icon" />
            </div>
          ) : (
            <CategoryForm
              id={id}
              onSubmit={onSubmit}
              disabled={isPending}
              onDelete={onDelete}
              defaultValues={defaultValues}
              iconOptions={iconOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
