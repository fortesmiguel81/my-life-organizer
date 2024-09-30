import React, { useMemo, useState } from "react";

import { Check, ChevronsUpDown } from "lucide-react";
import { FixedSizeList as List } from "react-window";

import { Button } from "@/components/ui/button";
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
import {
  camelCaseWithSpacesToKebabCase,
  iconNameToCamelCaseWithSpaces,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

import Icon from "./icon";

type Props = {
  value?: string | null | undefined;
  onChange: (value?: string) => void;
  searchFor?: string;
  options: string[];
  disabled?: boolean;
};

export function IconCombobox({
  value,
  onChange,
  searchFor,
  options,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(
    () =>
      options.filter((option) => {
        const normalizedSearchQuery =
          camelCaseWithSpacesToKebabCase(searchQuery);

        return option.includes(normalizedSearchQuery);
      }),
    [options, searchQuery]
  );

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const option = filteredOptions[index];
    return (
      <CommandItem
        style={style}
        key={option}
        value={option}
        onSelect={(currentValue) => {
          onChange(currentValue === value ? "" : currentValue);
          setOpen(false);
        }}
      >
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            value === option ? "opacity-100" : "opacity-0"
          )}
        />
        <Icon name={option} className="mr-2 size-5" />
        {iconNameToCamelCaseWithSpaces(option)}
      </CommandItem>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center">
              <Icon name={value} className="mr-2 size-5" />
              {iconNameToCamelCaseWithSpaces(value)}
            </div>
          ) : (
            `Select ${searchFor}...`
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${searchFor}...`}
            value={searchQuery}
            onValueChange={(newValue) => setSearchQuery(newValue)}
          />
          <CommandList>
            <CommandEmpty>No {searchFor} found.</CommandEmpty>
            <CommandGroup>
              <List
                height={200} // Set the height of the list container
                itemCount={filteredOptions.length} // Total items
                itemSize={35} // Height of each row
                width="100%" // Width of the list container
              >
                {Row}
              </List>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
