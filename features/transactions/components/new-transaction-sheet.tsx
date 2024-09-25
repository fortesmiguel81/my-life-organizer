import { z } from "zod";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertTransactionSchema } from "@/db/schema";

import { useCreateTransaction } from "../api/use-create-transaction";
import { useNewTransaction } from "../hooks/use-new-transaction";

const formSchema = insertTransactionSchema.omit({
  id: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

type FormValues = z.input<typeof formSchema>;

export default function NewTransactionSheet() {
  const { isOpen, onClose } = useNewTransaction();

  const mutation = useCreateTransaction();

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>
            Create a new transaction to track your expenses.
          </SheetDescription>
        </SheetHeader>
        {/* <TransactionForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            amount: 0,
            category_id: "",
            date: new Date().toISOString(),
            description: "",
            type: "expense",
          }}
        /> */}
      </SheetContent>
    </Sheet>
  );
}
