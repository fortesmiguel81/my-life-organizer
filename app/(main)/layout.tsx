"use client";

import Navbar from "@/app/(main)/_components/navbar";
import SearchCommand from "@/components/search-command";

import { PageBreadcrumb } from "./_components/breadcrumb";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full bg-background">
      <Navbar />
      <main className="flex-1 overflow-y-auto pt-20">
        <SearchCommand />
        <div className="flex flex-col px-14 py-6">
          <PageBreadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
