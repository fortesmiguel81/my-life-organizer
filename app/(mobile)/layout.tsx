"use client";

import Image from "next/image";
import Link from "next/link";

import { UserButton } from "@clerk/nextjs";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/quick-add" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={28} height={28} />
          <span className="text-sm font-semibold">Life Organizer</span>
        </Link>
        <UserButton afterSignOutUrl="/sign-in" />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
