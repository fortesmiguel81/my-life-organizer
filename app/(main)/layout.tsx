"use client";

import LoadingIndicator from "@/components/loading-indicator";
import Navbar from "@/components/navbar";
import SearchCommand from "@/components/modals/search-command";
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
      <Navbar />
      <main className="h-screen flex-1 overflow-y-auto pt-20">
        <SearchCommand />
        <div className="flex flex-col px-14 py-6">
          <PageBreadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
