"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowRightLeft,
  ChartColumnStacked,
  CreditCard,
  LayoutDashboard,
  PiggyBank,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";

const routes = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Finance",
    href: "/finance",
    subRoutes: [
      {
        name: "Accounts",
        href: "/finance/accounts",
        icon: CreditCard,
      },
      {
        name: "Categories",
        href: "/finance/categories",
        icon: ChartColumnStacked,
      },
      {
        name: "Transactions",
        href: "/finance/transactions",
        icon: ArrowRightLeft,
      },
      {
        name: "Budgets",
        href: "/finance/budgets",
        icon: PiggyBank,
      },
    ],
  },
];

export default function SearchCommand() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  const { isOpen, OnClose, toggle } = useSearch();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", down);

    return () => {
      window.removeEventListener("keydown", down);
    };
  }, [toggle]);

  const handleNavigate = (href: string) => {
    router.push(href);
    OnClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={OnClose}>
      <CommandInput placeholder={`Search...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {routes.map((route) =>
          route.subRoutes ? (
            <CommandGroup key={route.name} heading={route.name}>
              {route.subRoutes.map((subRoute) => (
                <CommandItem
                  key={subRoute.name}
                  onSelect={() => handleNavigate(subRoute.href)}
                >
                  {subRoute.icon && <subRoute.icon className="mr-2 h-4 w-4" />}
                  <span>{subRoute.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandItem
              key={route.name}
              onClick={() => router.push(route.href)}
            >
              {route.icon && <route.icon className="mr-2 h-4 w-4" />}
              <span>{route.name}</span>
            </CommandItem>
          )
        )}
      </CommandList>
    </CommandDialog>
  );
}
