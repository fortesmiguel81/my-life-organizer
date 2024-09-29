"use client";

import PageTitle from "@/components/page-title";
import Spinner from "@/components/spinner";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

import { AccountsDataTable } from "./_components/accounts-data-table";
import { accountsColumnsDefinition } from "./columns";

export default function AccountsPage() {
  const accountsQuery = useGetAccounts();
  const accounts = accountsQuery.data || [];

  const isLoading = accountsQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle title="Accounts" subTitle="Manage your accounts" />
      {isLoading ? (
        <div className="flex w-full items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <AccountsDataTable
          columns={accountsColumnsDefinition}
          data={accounts}
        />
      )}
    </div>
  );
}
