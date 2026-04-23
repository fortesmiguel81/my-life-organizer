"use client";

import { Dispatch, SetStateAction, useState } from "react";

import { InferResponseType } from "hono";
import { PlusCircle } from "lucide-react";

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
import { client } from "@/lib/hono";

type AccountsResponseType = InferResponseType<
  typeof client.api.accounts.$get,
  200
>["data"][0];

interface AccountDropdownFilterProps {
  accounts: AccountsResponseType[];
  selectedAccounts: AccountsResponseType[];
  setSelectedAccounts: Dispatch<SetStateAction<AccountsResponseType[]>>;
}

export function AccountDropdownFilter({
  accounts,
  selectedAccounts,
  setSelectedAccounts,
}: AccountDropdownFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex h-9 items-center justify-start border-dashed bg-muted/50 leading-none"
          >
            <div className="flex items-center text-sm leading-none">
              <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
              <span>Account</span>
            </div>
            {selectedAccounts.length > 0 && (
              <>
                <Separator
                  orientation="vertical"
                  className="mx-2 h-4 w-[1px] shrink-0 bg-border"
                />
                <div className="flex items-center gap-2">
                  {selectedAccounts.length >= 3 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm py-1 text-sm leading-none"
                    >
                      {selectedAccounts.length} selected
                    </Badge>
                  ) : (
                    selectedAccounts.map((account) => (
                      <Badge
                        key={account.id}
                        variant="secondary"
                        className="rounded-sm bg-muted py-1 text-sm leading-none"
                      >
                        {account.name}
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
            <CommandInput placeholder="Search accounts..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {accounts.map((account) => (
                  <CommandItem key={account.id} value={account.name}>
                    <div className="flex h-6 items-center space-x-2">
                      <Checkbox
                        id={account.id}
                        checked={
                          selectedAccounts.find((a) => a.id === account.id) !==
                          undefined
                        }
                        onCheckedChange={() => {
                          setSelectedAccounts((prev) => {
                            const isSelected = prev.some(
                              (a) => a.id === account.id
                            );
                            return isSelected
                              ? prev.filter((a) => a.id !== account.id)
                              : [...prev, account];
                          });
                        }}
                      />
                      <label
                        htmlFor={account.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {account.name}
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
