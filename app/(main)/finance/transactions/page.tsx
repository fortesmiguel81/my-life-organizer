"use client";

import PageTitle from "@/app/(main)/_components/page-title";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";

import { TransactionsDataTable } from "./_components/transactions-data-table";
import { transactionsColumnsDefinition } from "./columns";

export default function TransactionsPage() {
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle
        title="Transactions"
        subTitle="Manage your transactions history"
      />
      <TransactionsDataTable
        columns={transactionsColumnsDefinition}
        data={transactions}
      />
    </div>
  );
}
