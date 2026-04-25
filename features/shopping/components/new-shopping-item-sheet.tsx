import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateShoppingItem } from "@/features/shopping/api/use-create-shopping-item";
import { useGetShoppingLists } from "@/features/shopping/api/use-get-shopping-lists";
import { useNewShoppingItem } from "@/features/shopping/hooks/use-new-shopping-item";

import ShoppingItemForm, { ShoppingItemFormValues } from "./shopping-item-form";

export default function NewShoppingItemSheet() {
  const { isOpen, onClose, defaultListId } = useNewShoppingItem();
  const mutation = useCreateShoppingItem();
  const { data: lists = [] } = useGetShoppingLists();

  const onSubmit = (values: ShoppingItemFormValues) => {
    mutation.mutate(
      { ...values, estimatedPrice: values.estimatedPrice ?? null },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Item</SheetTitle>
          <SheetDescription>Add a new item to your shopping list.</SheetDescription>
        </SheetHeader>
        <ShoppingItemForm
          lists={lists}
          defaultValues={{ listId: defaultListId }}
          onSubmit={onSubmit}
          disabled={mutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}
