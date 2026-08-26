"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Menu, SearchIcon, SettingsIcon, X } from "lucide-react";

import Spinner from "@/components/spinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useGetCurrentProfile } from "@/features/profiles/api/use-get-current-profile";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

import ProfileSwitcher from "./profile-switcher";

type NavEntry =
  | { type: "link"; href: string; label: string }
  | {
      type: "group";
      id: string;
      label: string;
      links: { href: string; label: string }[];
    };

const NAV_ENTRIES: NavEntry[] = [
  { type: "link", href: "/dashboard", label: "Dashboard" },
  { type: "link", href: "/calendar", label: "Calendar" },
  { type: "link", href: "/tasks", label: "Tasks" },
  { type: "link", href: "/documents", label: "Documents" },
  { type: "link", href: "/habits", label: "Habits" },
  {
    type: "group",
    id: "home",
    label: "Home",
    links: [
      { href: "/vendors", label: "Vendors" },
      { href: "/assets", label: "Assets" },
      { href: "/maintenance", label: "Maintenance" },
      { href: "/utilities", label: "Utilities" },
    ],
  },
  { type: "link", href: "/shopping", label: "Shopping" },
  {
    type: "group",
    id: "finance",
    label: "Finance",
    links: [
      { href: "/finance", label: "Overview" },
      { href: "/finance/accounts", label: "Accounts" },
      { href: "/finance/categories", label: "Categories" },
      { href: "/finance/transactions", label: "Transactions" },
      { href: "/finance/budgets", label: "Budgets" },
    ],
  },
];

const linkClass = (active: boolean) =>
  cn(
    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ENTRIES.map((entry) => {
        if (entry.type === "link") {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              onClick={onNavigate}
              className={linkClass(pathname.startsWith(entry.href))}
            >
              {entry.label}
            </Link>
          );
        }

        const groupActive = entry.links.some((l) =>
          pathname.startsWith(l.href)
        );

        return (
          <Accordion
            key={entry.id}
            type="single"
            collapsible
            defaultValue={groupActive ? entry.id : undefined}
          >
            <AccordionItem value={entry.id} className="border-none">
              <AccordionTrigger
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium no-underline hover:no-underline",
                  groupActive
                    ? "text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {entry.label}
              </AccordionTrigger>
              <AccordionContent className="pb-0 pl-3">
                <div className="flex flex-col gap-1 border-l pl-3">
                  {entry.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={onNavigate}
                      className={linkClass(pathname.startsWith(l.href))}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const search = useSearch();
  const settings = useSettings();
  const { data: profile, isLoading: isLoadingProfile } = useGetCurrentProfile();

  return (
    <div className="flex flex-col gap-2 border-t p-3">
      <Button
        variant="outline"
        onClick={search.OnOpen}
        className="justify-start gap-2 text-muted-foreground"
      >
        <SearchIcon className="size-4" />
        Search...
        <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">
          CTRL K
        </kbd>
      </Button>
      <div className="flex items-center justify-between gap-2">
        {isLoadingProfile ? (
          <Spinner size="lg" />
        ) : (
          <ProfileSwitcher profile={profile} />
        )}
        <Button variant="ghost" size="icon" onClick={settings.OnOpen}>
          <SettingsIcon className="size-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: persistent left sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 border-b p-4 font-bold"
        >
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          Life Organizer
        </Link>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList pathname={pathname} />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile: slim top bar + slide-out drawer */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 font-bold">
          <Image src="/logo.svg" alt="logo" width={28} height={28} />
          Life Organizer
        </Link>
      </div>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-[99998] bg-black/50 lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[99999] flex w-64 flex-col overflow-y-auto border-r bg-background transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2 font-bold"
          >
            <Image src="/logo.svg" alt="logo" width={28} height={28} />
            Life Organizer
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavList
            pathname={pathname}
            onNavigate={() => setIsMobileOpen(false)}
          />
        </div>
        <SidebarFooter />
      </aside>
    </>
  );
}
