"use client";

import { useEffect } from "react";

import PageTitle from "@/components/page-title";
import Spinner from "@/components/spinner";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useProcessRecurring } from "@/features/transactions/api/use-process-recurring";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { TransactionsDataTable } from "./_components/transactions-data-table";
import { transactionsColumnsDefinition } from "./columns";

export default function TransactionsPage() {
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];
  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data || [];
  const accountsQuery = useGetAccounts();
  const accounts = accountsQuery.data || [];
  const processRecurring = useProcessRecurring();

  useEffect(() => {
    processRecurring.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoading = transactionsQuery.isLoading && categoriesQuery.isLoading && accountsQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle title="Transactions" subTitle="Manage your transactions history" />
      {isLoading ? (
        <div className="flex w-full items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <TransactionsDataTable
          columns={transactionsColumnsDefinition}
          data={transactions}
          categories={categories}
          accounts={accounts}
        />
      )}
    </div>
  );
}
