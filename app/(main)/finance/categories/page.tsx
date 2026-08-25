"use client";

import PageTitle from "@/components/page-title";
import Spinner from "@/components/spinner";
import { useGetCategories } from "@/features/categories/api/use-get-categories";

import { CategoriesDataTable } from "./_components/categories-data-table";
import { categoriesColumnsDefinition } from "./columns";

export default function CategoriesPage() {
  const categoriesQuery = useGetCategories();
  const categories = categoriesQuery.data || [];

  const isLoading = categoriesQuery.isLoading;

  return (
    <div className="flex w-full flex-col gap-4 pt-6">
      <PageTitle
        title="Categories"
        subTitle="Manage your transaction categories"
      />
      {isLoading ? (
        <div className="flex w-full items-center justify-center">
          <Spinner size="icon" />
        </div>
      ) : (
        <CategoriesDataTable
          columns={categoriesColumnsDefinition}
          data={categories}
        />
      )}
    </div>
  );
}
