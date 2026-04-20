"use client";

import { useState } from "react";

import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import Spinner from "@/components/spinner";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";
import TransactionForm, {
  TransactionFormSubmitValues,
} from "@/features/transactions/components/transaction-form";

export default function QuickAddPage() {
  const [submitted, setSubmitted] = useState(false);

  const createMutation = useCreateTransaction();

  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const onCreateAccount = (name: string) => {
    accountMutation.mutate({ name, number: "", holder: "", balance: 0 });
  };

  const accountOptions = (accountQuery.data ?? []).map((a) => ({
    label: a.name,
    value: a.id,
    prop: "",
  }));

  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const onCreateCategory = (name: string) => {
    categoryMutation.mutate({ name });
  };

  const categoryOptions = (categoryQuery.data ?? []).map((c) => ({
    label: c.name,
    value: c.id,
    prop: c.icon ?? "",
  }));

  const isPending =
    createMutation.isPending ||
    accountMutation.isPending ||
    categoryMutation.isPending;

  const isLoading = accountQuery.isLoading || categoryQuery.isLoading;

  const onSubmit = (values: TransactionFormSubmitValues) => {
    createMutation.mutate(
      {
        ...values,
        description: values.description ?? "",
        nextDueDate: values.nextDueDate ?? null,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 2500);
        },
        onError: () => {
          toast.error("Failed to save transaction.");
        },
      }
    );
  };

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Quick Add</h1>
        <p className="text-sm text-muted-foreground">
          Log a transaction on the go
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <CheckCircle2 className="size-16 text-emerald-500" />
          <p className="text-lg font-medium">Saved!</p>
          <p className="text-sm text-muted-foreground">
            Your transaction was recorded.
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <TransactionForm
          onSubmit={onSubmit}
          disabled={isPending}
          accountOptions={accountOptions}
          onCreateAccount={onCreateAccount}
          categoryOptions={categoryOptions}
          onCreateCategory={onCreateCategory}
        />
      )}
    </div>
  );
}
