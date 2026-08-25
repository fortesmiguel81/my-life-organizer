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
import { useNewCategory } from "@/features/categories/hooks/use-new-category";

interface DataTableProps<CategoriesResponseType, TValue> {
  columns: ColumnDef<CategoriesResponseType, TValue>[];
  data: CategoriesResponseType[];
}

export function CategoriesDataTable<CategoriesResponseType, TValue>({
  columns,
  data,
}: DataTableProps<CategoriesResponseType, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const newCategory = useNewCategory();

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

  const handleExportCategories = () => {
    // TODO: Implement export categories
    alert("Exporting categories...");
  };

  return (
    <div className="flex flex-col">
      <div className="mt-3 flex flex-col justify-between gap-4 md:h-9 md:flex-row lg:h-9 lg:flex-row">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter categories..."
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
            onClick={handleExportCategories}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            className="font-md h-9 w-full md:w-auto lg:w-auto"
            onClick={newCategory.onOpen}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add Category</span>
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
