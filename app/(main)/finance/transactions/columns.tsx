"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { InferResponseType } from "hono";
import { ArrowUpDown } from "lucide-react";

import Actions from "@/components/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";
import { formatCurrency } from "@/lib/utils";

import AccountColumn from "./_components/account-column";
import CategoryColumn from "./_components/category-column";

type TransactionsResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

type CategoriesResponseType = InferResponseType<
  typeof client.api.categories.$get,
  200
>["data"][0];

export const transactionsColumnsDefinition: ColumnDef<TransactionsResponseType>[] =
  [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("date") as Date;

        return (
          <div className="font-medium">{format(date, "dd MMMM, yyyy")}</div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <CategoryColumn
            id={row.original.id}
            category={row.original.category}
            categoryId={row.original.categoryId}
          />
        );
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterCategories) => {
        if (filterCategories.length === 0) return true;
        const category = row.getValue(columnId);
        return filterCategories.some(
          (c: CategoriesResponseType) => c.name === category
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      enableGlobalFilter: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "payee",
      header: "Payee",
      enableGlobalFilter: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));

        return (
          <Badge
            variant={amount < 0 ? "destructive" : "success"}
            className="px-3.5 py-2.5 text-xs font-medium"
          >
            {formatCurrency(amount)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "account",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Account
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <AccountColumn
            account={row.original.account}
            accountId={row.original.accountId}
          />
        );
      },
      enableGlobalFilter: true,
      filterFn: "includesString",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <Actions id={row.original.id} />;
      },
    },
  ];
