import Spinner from "@/components/spinner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDeleteShoppingItem } from "@/features/shopping/api/use-delete-shopping-item";
import { useEditShoppingItem } from "@/features/shopping/api/use-edit-shopping-item";
import { useGetShoppingItem } from "@/features/shopping/api/use-get-shopping-item";
import { useGetShoppingLists } from "@/features/shopping/api/use-get-shopping-lists";
import { useOpenShoppingItem } from "@/features/shopping/hooks/use-open-shopping-item";
import { useConfirm } from "@/hooks/use-confirm";

import ShoppingItemForm, { ShoppingItemFormValues } from "./shopping-item-form";

export default function EditShoppingItemSheet() {
  const { id, isOpen, onClose } = useOpenShoppingItem();
  const { data: lists = [] } = useGetShoppingLists();
  const itemQuery = useGetShoppingItem(id);
  const editMutation = useEditShoppingItem(id);
  const deleteMutation = useDeleteShoppingItem(id);
  const [ConfirmDialog, confirm] = useConfirm("Delete item?", "This cannot be undone.");

  const item = itemQuery.data;

  const onSubmit = (values: ShoppingItemFormValues) => {
    editMutation.mutate(
      { ...values, estimatedPrice: values.estimatedPrice ?? null },
      { onSuccess: onClose }
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Item</SheetTitle>
            <SheetDescription>Update item details.</SheetDescription>
          </SheetHeader>
          {itemQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="icon" />
            </div>
          ) : (
            <ShoppingItemForm
              id={id}
              lists={lists}
              defaultValues={
                item
                  ? {
                      listId: item.listId,
                      name: item.name,
                      quantity: item.quantity,
                      unit: item.unit ?? "",
                      category: item.category,
                      estimatedPrice: item.estimatedPrice,
                      note: item.note ?? "",
                    }
                  : undefined
              }
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={editMutation.isPending || deleteMutation.isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
