import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDeleteShoppingList } from "@/features/shopping/api/use-delete-shopping-list";
import { useEditShoppingList } from "@/features/shopping/api/use-edit-shopping-list";
import { useGetShoppingLists } from "@/features/shopping/api/use-get-shopping-lists";
import { useOpenShoppingList } from "@/features/shopping/hooks/use-open-shopping-list";
import { useConfirm } from "@/hooks/use-confirm";

import ShoppingListForm, { ShoppingListFormValues } from "./shopping-list-form";

export default function EditShoppingListSheet() {
  const { id, isOpen, onClose } = useOpenShoppingList();
  const listsQuery = useGetShoppingLists();
  const editMutation = useEditShoppingList(id);
  const deleteMutation = useDeleteShoppingList(id);
  const [ConfirmDialog, confirm] = useConfirm("Delete list?", "All items in this list will also be deleted.");

  const list = listsQuery.data?.find((l) => l.id === id);

  const onSubmit = (values: ShoppingListFormValues) => {
    editMutation.mutate(values, { onSuccess: onClose });
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Shopping List</SheetTitle>
            <SheetDescription>Update the list name or icon.</SheetDescription>
          </SheetHeader>
          <ShoppingListForm
            id={id}
            defaultValues={list ? { name: list.name, icon: list.icon ?? "" } : undefined}
            onSubmit={onSubmit}
            onDelete={onDelete}
            disabled={editMutation.isPending || deleteMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
