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
import {
  Car,
  Drama,
  File,
  Gift,
  GraduationCap,
  HandCoins,
  HandHeart,
  HeartPulse,
  Home,
  PawPrint,
  PiggyBank,
  PlusCircle,
  RectangleEllipsis,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  TvMinimalPlay,
  X,
} from "lucide-react";

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

import { Category } from "../../types/category";
import { CategoryDropdownFilter } from "./category-dropdown-filter";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const categories: Category[] = [
  {
    value: "Groceries",
    label: "Groceries",
    icon: ShoppingCart,
  },
  {
    value: "Transportation",
    label: "Transportation",
    icon: Car,
  },
  {
    value: "Entertainment",
    label: "Entertainment",
    icon: TvMinimalPlay,
  },
  {
    value: "Healthcare",
    label: "Healthcare",
    icon: HeartPulse,
  },
  {
    value: "Shopping",
    label: "Shopping",
    icon: ShoppingBag,
  },
  {
    value: "Education",
    label: "Education",
    icon: GraduationCap,
  },
  {
    value: "Pets",
    label: "Pets",
    icon: PawPrint,
  },
  {
    value: "Housing",
    label: "Housing",
    icon: Home,
  },
  {
    value: "Insurance",
    label: "Insurance",
    icon: ShieldCheck,
  },
  {
    value: "Savings",
    label: "Savings",
    icon: PiggyBank,
  },
  {
    value: "Investments",
    label: "Investments",
    icon: HandCoins,
  },
  {
    value: "Gifts",
    label: "Gifts",
    icon: Gift,
  },
  {
    value: "Donations",
    label: "Donations",
    icon: HandHeart,
  },
  {
    value: "Leisure",
    label: "Leisure",
    icon: Drama,
  },
  {
    value: "Miscellaneous",
    label: "Miscellaneous",
    icon: RectangleEllipsis,
  },
];

export function TransactionsDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams(); // Used to read query params

  // Update query parameters when filters change
  useEffect(() => {
    console.log("Updating query params");
    const query = new URLSearchParams({
      globalFilter,
      selectedCategories: selectedCategories.map((cat) => cat.value).join(","),
    });

    router.replace(`?${query.toString()}`);
  }, [globalFilter, selectedCategories, router]);

  // Read filters from the URL on initial load
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
          categories.find((category) => category.value === value) || {
            value,
            label: "Unknown", // Handle unknown categories
            icon: File, // Default icon
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
