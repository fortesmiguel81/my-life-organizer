"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useMediaQuery } from "usehooks-ts";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_TO_DISPLAY = 3;

export function PageBreadcrumb() {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const pathname = usePathname();

  function generateBreadcrumbItems(pathname: string) {
    const items = pathname
      .split("/")
      .filter((item) => item !== "")
      .map((item) => {
        return {
          label: item.charAt(0).toUpperCase() + item.slice(1),
          href: `/${item}`,
        };
      });

    // remove href from last item
    items[items.length - 1].href = "";

    return items;
  }

  const items = generateBreadcrumbItems(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem key={items[0].href}>
          <BreadcrumbLink href={items[0].href}>{items[0].label}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {items.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              {isDesktop ? (
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                  <DropdownMenuTrigger
                    className="flex items-center gap-1"
                    aria-label="Toggle menu"
                  >
                    <BreadcrumbEllipsis className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {items.slice(1, -1).map((item, index) => (
                      <DropdownMenuItem key={index}>
                        <Link href={item.href ? item.href : "#"}>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                  <DrawerTrigger aria-label="Toggle Menu">
                    <BreadcrumbEllipsis className="h-4 w-4" />
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="text-left">
                      <DrawerTitle>Navigate to</DrawerTitle>
                      <DrawerDescription>
                        Select a page to navigate to.
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-1 px-4">
                      {items.slice(1, -1).map((item, index) => (
                        <Link
                          key={index}
                          href={item.href ? item.href : "#"}
                          className="py-1 text-sm"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <DrawerFooter className="pt-4">
                      <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ) : null}
        {items.slice(-ITEMS_TO_DISPLAY + 2).map((item, index) => (
          <BreadcrumbItem key={index}>
            {item.href ? (
              <>
                <BreadcrumbLink
                  asChild
                  className="max-w-20 truncate md:max-w-none"
                >
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                {item.label}
              </BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
