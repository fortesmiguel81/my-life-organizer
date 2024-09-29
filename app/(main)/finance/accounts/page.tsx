"use client";

import { useState } from "react";

import { File, PlusCircle, X } from "lucide-react";

import PageTitle from "@/components/page-title";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

import AccountCard from "./_components/account-card";

export default function AccountsPage() {
  const accountsQuery = useGetAccounts();
  const accounts = accountsQuery.data || [];

  const [globalFilter, setGlobalFilter] = useState("");
  const newAccount = useNewAccount();

  const handleExportAccounts = () => {
    console.log("Export accounts");
  };

  const isLoading = accountsQuery.isLoading;

  const filteredAccounts = accounts.filter((account) => {
    const searchTerm = globalFilter.toLowerCase();

    return (
      account.name.toLowerCase().includes(searchTerm) ||
      account.holder.toLowerCase().includes(searchTerm) ||
      account.number.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle title="Accounts" subTitle="Manage your accounts" />
      {isLoading ? (
        <div className="flex w-full items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="mt-3 flex flex-col justify-between gap-4 md:h-9 md:flex-row lg:h-9 lg:flex-row">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Filter accounts..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="h-9 max-w-sm bg-muted/50"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  className="font-md h-9 px-3 py-0"
                  onClick={() => {
                    setGlobalFilter("");
                  }}
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="font-md h-9 w-full bg-muted/50 md:w-auto lg:w-auto"
                onClick={handleExportAccounts}
              >
                <File className="mr-2 h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button
                className="font-md h-9 w-full md:w-auto lg:w-auto"
                onClick={newAccount.onOpen}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Account</span>
              </Button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))
            ) : (
              <p className="col-span-3 p-10 text-center text-gray-500">
                No accounts found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
