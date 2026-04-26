import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElementRef, useCallback, useRef, useState } from "react";

import {
  OrganizationSwitcher,
  UserButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs";
import { ChevronLeft, SettingsIcon } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";

import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

import NavItem from "./nav-item";

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const search = useSearch();
  const sidebarRef = useRef<ElementRef<"aside">>(null);
  const { isLoaded: isLoadedOrganization } = useOrganization();
  const { user, isLoaded: isLoadedUser } = useUser();
  const settings = useSettings();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetWidth = useCallback(() => {
    if (sidebarRef.current && isMobile && !isSidebarOpen) {
      setIsResetting(true);
      setIsSidebarOpen(true);
      setTimeout(() => setIsResetting(false), 300);
    }
  }, [isMobile, isSidebarOpen]);

  const handleCollapse = () => {
    if (sidebarRef.current) {
      setIsResetting(true);
      setIsSidebarOpen(false);
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          "group/sidebar fixed z-[99999] flex h-full flex-col overflow-y-auto bg-secondary lg:hidden",
          isResetting && "transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-60" : "w-0",
          isSidebarOpen && "p-3"
        )}
      >
        <div
          onClick={handleCollapse}
          role="button"
          className={cn(
            "absolute right-2 top-5 h-6 w-6 rounded-sm text-muted-foreground transition-opacity hover:bg-neutral-300 dark:hover:bg-neutral-600",
            isSidebarOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </div>
        <div className="flex flex-col p-4">
          <div className="flex items-center gap-3">
            {isLoadedUser ? <UserButton /> : <Spinner size="lg" />}
            <span>
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </div>
        <div className="absolute bottom-2 p-2">
          {isLoadedOrganization && isLoadedUser ? (
            <OrganizationSwitcher />
          ) : (
            <Spinner size="lg" />
          )}
        </div>
      </aside>
      <div
        onClick={handleCollapse}
        className={cn(
          "absolute z-[99998] hidden h-full w-full bg-black/50 blur-sm",
          isSidebarOpen && "block"
        )}
      />

      <div className="fixed top-0 z-50 flex w-full border-border/40 bg-background/95 p-5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full items-center justify-start md:justify-between lg:justify-between">
          <div className="flex items-center gap-6">
            <div
              className="flex items-center justify-between"
              role={isMobile ? "button" : undefined}
              onClick={isSidebarOpen ? handleCollapse : handleResetWidth}
            >
              <Image src="/logo.svg" alt="logo" width={50} height={50} />
              {!isMobile && (
                <h1 className="ml-4 text-xl font-bold">Life Organizer</h1>
              )}
            </div>
            {!isMobile &&
              (isLoadedOrganization && isLoadedUser ? (
                <OrganizationSwitcher />
              ) : (
                <Spinner size="lg" />
              ))}
            {!isMobile && (
              <NavigationMenu className="ml-4">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link href="/dashboard" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathname.startsWith("/dashboard")}
                        className={navigationMenuTriggerStyle()}
                      >
                        Dashboard
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        pathname.startsWith("/finance") && "bg-accent/50"
                      )}
                    >
                      Calendar
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link href="/calendar">
                              <div className="flex h-full w-full cursor-default select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none hover:cursor-pointer focus:shadow-md">
                                <Image
                                  src="/calendar.svg"
                                  alt="Calendar"
                                  width={50}
                                  height={50}
                                />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Calendar Management
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Manage your appointments, events, and
                                  important dates.
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        pathname.startsWith("/finance") && "bg-accent/50"
                      )}
                    >
                      Tasks
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link href="/tasks">
                              <div className="flex h-full w-full cursor-default select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none hover:cursor-pointer focus:shadow-md">
                                <Image
                                  src="/to-do.svg"
                                  alt="ToDo"
                                  width={50}
                                  height={50}
                                />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Task Management
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Manage your tasks, track your progress, and
                                  stay organized.
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/documents" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathname.startsWith("/documents")}
                        className={navigationMenuTriggerStyle()}
                      >
                        Documents
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/habits" legacyBehavior passHref>
                      <NavigationMenuLink
                        active={pathname.startsWith("/habits")}
                        className={navigationMenuTriggerStyle()}
                      >
                        Habits
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        pathname.startsWith("/shopping") && "bg-accent/50"
                      )}
                    >
                      Shopping
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link href="/shopping">
                              <div className="flex h-full w-full cursor-default select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none hover:cursor-pointer focus:shadow-md">
                                <span className="text-4xl">🛒</span>
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Shopping Lists
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Manage grocery and shopping lists, track
                                  estimated costs, and log purchases.
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={cn(
                        pathname.startsWith("/finance") && "bg-accent/50"
                      )}
                    >
                      Finance
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                        <li className="row-span-4">
                          <NavigationMenuLink asChild>
                            <Link href="/finance">
                              <div className="flex h-full w-full cursor-default select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none hover:cursor-pointer focus:shadow-md">
                                <Image
                                  src="/finance.svg"
                                  alt="Finance"
                                  width={50}
                                  height={50}
                                />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Finance Management
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Manage your finance, track your expenses and
                                  income.
                                </p>
                              </div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <NavItem href="/finance/accounts" title="Accounts">
                          Manage your accounts, track your balance.
                        </NavItem>
                        <NavItem href="/finance/categories" title="Categories">
                          Manage your spending categories.
                        </NavItem>
                        <NavItem href="/finance/transactions" title="Transactions">
                          Manage your transactions, track your expenses and
                          income.
                        </NavItem>
                        <NavItem href="/finance/budgets" title="Budgets">
                          Manage your budgets, track your spending.
                        </NavItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>
          <div className="ml-3 flex w-full items-center gap-3 md:ml-0 md:w-auto lg:ml-0 lg:w-auto">
            <div className="h-full w-full flex-1 md:w-auto md:flex-none">
              <Button
                onClick={search.OnOpen}
                className="relative inline-flex h-full w-full items-center justify-start whitespace-nowrap rounded-[0.5rem] border border-input bg-muted/50 px-4 py-2 text-sm font-normal text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-40 lg:w-64"
              >
                <span>Search...</span>
                <kbd className="pointer-events-none absolute right-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">CTRL K</span>
                </kbd>
              </Button>
            </div>
            <Button variant="ghost" onClick={settings.OnOpen}>
              <SettingsIcon className="h-6 w-6 text-muted-foreground" />
            </Button>
            {!isMobile &&
              (isLoadedUser ? <UserButton /> : <Spinner size="lg" />)}
          </div>
        </div>
      </div>
    </>
  );
}
