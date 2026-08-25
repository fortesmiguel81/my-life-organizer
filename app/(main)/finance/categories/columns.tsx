"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InferResponseType } from "hono";
import { ArrowUpDown } from "lucide-react";

import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";

import Actions from "./_components/actions";

type CategoriesResponseType = InferResponseType<
  typeof client.api.categories.$get,
  200
>["data"][0];

export const categoriesColumnsDefinition: ColumnDef<CategoriesResponseType>[] =
  [
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
      accessorKey: "description",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Description
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableGlobalFilter: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: ({ row }) => {
        const icon = row.original.icon || "";
        return <Icon name={icon} className="mr-2 size-5" />;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return <Actions id={row.original.id} />;
      },
    },
  ];
