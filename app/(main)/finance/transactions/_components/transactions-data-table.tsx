"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { File, PlusCircle, X } from "lucide-react";

import { CategoriesResponseType } from "@/app/api/response-types";
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

import { CategoryDropdownFilter } from "./category-dropdown-filter";

interface DataTableProps<TransactionsResponseType, TValue> {
  columns: ColumnDef<TransactionsResponseType, TValue>[];
  data: TransactionsResponseType[];
  categories: CategoriesResponseType[];
}

export function TransactionsDataTable<TransactionsResponseType, TValue>({
  columns,
  data,
  categories,
}: DataTableProps<TransactionsResponseType, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    CategoriesResponseType[]
  >([]);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = new URLSearchParams({
      globalFilter,
      selectedCategories: selectedCategories
        .map((category) => category.id)
        .join(","),
    });

    router.replace(`?${query.toString()}`);
  }, [globalFilter, selectedCategories, router]);

  useEffect(() => {
    const globalFilterParam = searchParams.get("globalFilter");
    const selectedCategoriesParam = searchParams.get("selectedCategories");

    if (globalFilterParam) {
      setGlobalFilter(globalFilterParam);
    }

    if (selectedCategoriesParam) {
      const categoryValues = selectedCategoriesParam.split(",");

      const mappedCategories = categoryValues.map(
        (value: string) =>
          categories.find((category) => category.id === value) || {
            orgId: "",
            id: "",
            description: "",
            name: "",
            userId: "",
            created_at: "",
            created_by: "",
            updated_at: "",
            updated_by: "",
            icon: "",
          }
      );

      setSelectedCategories(mappedCategories);
    }
  }, [searchParams]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  useEffect(() => {
    table.getColumn("category")?.setFilterValue(selectedCategories);
  }, [selectedCategories, table]);

  const handleExportTransactions = () => {
    // TODO: Implement export transactions
    alert("Exporting transactions...");
  };

  const handleAddNewTransaction = () => {
    // TODO: implement add new transaction
    alert("Exporting transactions...");
  };

  return (
    <div className="flex flex-col">
      <div className="mt-3 flex h-9 justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter transactions..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="h-9 max-w-sm"
          />
          <CategoryDropdownFilter
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
          {(globalFilter || selectedCategories.length > 0) && (
            <Button
              variant="ghost"
              className="font-md h-9 px-3 py-0"
              onClick={() => {
                setGlobalFilter("");
                setSelectedCategories([]);
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
            className="font-md h-9"
            onClick={handleExportTransactions}
          >
            <File className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button className="font-md h-9" onClick={handleAddNewTransaction}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Add Transaction</span>
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
