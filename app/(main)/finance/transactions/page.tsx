"use client";

import { useOrganization } from "@clerk/nextjs";

import PageTitle from "@/app/(main)/_components/page-title";
import Spinner from "@/components/spinner";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";

import { TransactionsDataTable } from "./_components/transactions-data-table";
import { transactionsColumnsDefinition } from "./columns";

export default function TransactionsPage() {
  const org = useOrganization();
  const transactionsQuery = useGetTransactions(org.organization?.id);
  const transactions = transactionsQuery.data || [];
  const categoriesQuery = useGetCategories(org.organization?.id);
  const categories = categoriesQuery.data || [];

  const isLoading = transactionsQuery.isLoading && categoriesQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle
        title="Transactions"
        subTitle="Manage your transactions history"
      />
      {isLoading ? (
        <div className="w-full flex items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <TransactionsDataTable
          columns={transactionsColumnsDefinition}
          data={transactions}
          categories={categories}
        />
      )}
    </div>
  );
}
