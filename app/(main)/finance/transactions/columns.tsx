"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { ArrowUpDown } from "lucide-react";

import { CategoriesResponseType } from "@/app/api/response-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

export type ResponseType = InferResponseType<
  typeof client.api.transactions.$get,
  200
>["data"][0];

export const transactionsColumnsDefinition: ColumnDef<ResponseType>[] = [
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
      const amount = new Date(row.getValue("date"));
      const formatted = new Intl.DateTimeFormat("en-US").format(amount);

      return <div className="font-medium">{formatted}</div>;
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
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return (
        <Badge
          variant={amount < 0 ? "destructive" : "primary"}
          className="px-3.5 py-2.5 text-xs font-medium"
        >
          {formatted}
        </Badge>
      );
    },
  },
  {
    accessorKey: "account",
    header: "Account",
    enableGlobalFilter: true,
    filterFn: "includesString",
  },
];
