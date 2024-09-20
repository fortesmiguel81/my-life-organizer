"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Category } from "../types/category";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  date: Date;
  amount: number;
  category: string;
  payee: string;
  account: string;
  shortDescription: string;
  longDescription: string;
};

export const transactionsColumnsDefinition: ColumnDef<Payment>[] = [
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
      return filterCategories.some((c: Category) => c.value === category);
    },
  },
  {
    accessorKey: "shortDescription",
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
