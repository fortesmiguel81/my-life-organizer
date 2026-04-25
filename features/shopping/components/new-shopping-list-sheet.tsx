import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateShoppingList } from "@/features/shopping/api/use-create-shopping-list";
import { useNewShoppingList } from "@/features/shopping/hooks/use-new-shopping-list";

import ShoppingListForm, { ShoppingListFormValues } from "./shopping-list-form";

export default function NewShoppingListSheet() {
  const { isOpen, onClose } = useNewShoppingList();
  const mutation = useCreateShoppingList();

  const onSubmit = (values: ShoppingListFormValues) => {
    mutation.mutate(values, { onSuccess: onClose });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Shopping List</SheetTitle>
          <SheetDescription>Create a new shopping list.</SheetDescription>
        </SheetHeader>
        <ShoppingListForm onSubmit={onSubmit} disabled={mutation.isPending} />
      </SheetContent>
    </Sheet>
  );
}
