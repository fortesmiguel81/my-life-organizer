"use client";

import { useState } from "react";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { File, PlusCircle, X } from "lucide-react";

import { DataTablePagination } from "@/components/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

interface DataTableProps<AccountsResponseType, TValue> {
  columns: ColumnDef<AccountsResponseType, TValue>[];
  data: AccountsResponseType[];
}

export function AccountsDataTable<AccountsResponseType, TValue>({
  columns,
  data,
}: DataTableProps<AccountsResponseType, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const newAccount = useNewAccount();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleExportAccounts = () => {
    // TODO: Implement export accounts
    alert("Exporting accounts...");
  };

  return (
    <div className="flex flex-col">
      <div className="mt-3 flex h-9 justify-between">
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
            className="font-md h-9 bg-muted/50"
            onClick={handleExportAccounts}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="font-md h-9" onClick={newAccount.onOpen}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add Account</span>
          </Button>
        </div>
      </div>
      <div className="mt-3 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
