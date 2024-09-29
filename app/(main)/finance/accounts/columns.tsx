"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

import Actions from "./_components/actions";

type AccountsResponseType = InferResponseType<
  typeof client.api.accounts.$get,
  200
>["data"][0];

export const accountsColumnsDefinition: ColumnDef<AccountsResponseType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
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
