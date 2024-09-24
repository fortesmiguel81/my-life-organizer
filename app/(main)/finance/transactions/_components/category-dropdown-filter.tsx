"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { PlusCircle } from "lucide-react";

import { CategoriesResponseType } from "@/app/api/response-types";
import Icon from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface CategoryDropdownFilterProps {
  categories: CategoriesResponseType[];
  selectedCategories: CategoriesResponseType[];
  setSelectedCategories: Dispatch<SetStateAction<CategoriesResponseType[]>>;
}

export function CategoryDropdownFilter({
  categories,
  selectedCategories,
  setSelectedCategories,
}: CategoryDropdownFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex h-9 items-center justify-start border-dashed leading-none"
          >
            <div className="flex items-center text-sm leading-none">
              <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>Category</span>
            </div>
            {selectedCategories.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="mx-2 h-4 w-[1px] shrink-0 bg-border"
                />
                <div className="flex items-center gap-2">
                  {selectedCategories.length >= 3 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm py-1 text-sm leading-none"
                    >
                      {selectedCategories.length} selected
                    </Badge>
                  ) : (
                    selectedCategories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="rounded-sm py-1 text-sm leading-none"
                      >
                        {category.name}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          <Command>
            <CommandInput placeholder="Change status..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem key={category.id} value={category.name}>
                    <div className="flex h-6 items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={
                          selectedCategories.find(
                            (c) => c.id === category.id
                          ) !== undefined
                        }
                        onCheckedChange={() => {
                          setSelectedCategories((prevSelectedCategories) => {
                            const isAlreadySelected =
                              prevSelectedCategories?.some(
                                (s) => s.id === category.id
                              );
                            if (isAlreadySelected) {
                              return prevSelectedCategories.filter(
                                (s) => s.id !== category.id
                              );
                            } else {
                              return [
                                ...(prevSelectedCategories || []),
                                category,
                              ];
                            }
                          });
                        }}
                      />
                      <Icon
                        name={category.icon!}
                        className="h-4 w-4 shrink-0"
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
