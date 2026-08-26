"use client";

import LoadingIndicator from "@/components/loading-indicator";
import SearchCommand from "@/components/modals/search-command";
import Sidebar from "@/components/sidebar";
import { useOrganizationQueryInvalidation } from "@/hooks/use-organization-query-invalidation";

import { PageBreadcrumb } from "../../components/breadcrumb";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useOrganizationQueryInvalidation();
  return (
    <div className="h-full bg-muted/20">
      <LoadingIndicator />
      <Sidebar />
      <main className="h-screen flex-1 overflow-y-auto pt-14 lg:pl-64 lg:pt-0">
        <SearchCommand />
        <div className="flex flex-col px-4 py-6 sm:px-8 lg:px-8">
          <PageBreadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
