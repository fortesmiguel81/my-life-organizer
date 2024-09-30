import Image from "next/image";
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
import { cn } from "@/lib/utils";

// Assuming we have a predefined array of SVG paths for the bank icons
const svgIcons = [
  { name: "A Banca", path: "/bank-icons/abanca.svg" },
  { name: "Santander", path: "/bank-icons/santander.svg" },
  { name: "Millenium", path: "/bank-icons/millenium.svg" },
  // Add more icons here as needed
];

type Props = {
  value?: string | null | undefined;
  onChange: (value?: string) => void;
  searchFor?: string;
  disabled?: boolean;
};

export function SvgCombobox({ value, onChange, searchFor, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter the options based on the search query
  const filteredOptions = useMemo(
    () =>
      svgIcons.filter((option) =>
        option.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
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
        key={option.path}
        value={option.name}
        onSelect={() => {
          onChange(option.path === value ? "" : option.path);
          setOpen(false);
        }}
      >
        <Check
          className={cn(
            "mr-2 h-4 w-4",
            value === option.path ? "opacity-100" : "opacity-0"
          )}
        />
        <Image
          src={option.path}
          alt={option.name}
          width={60}
          height={60}
          className="mr-2 w-7"
        />
        {option.name}
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
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          {value ? (
            <div className="flex items-center">
              <Image
                src={value}
                alt="Selected Icon"
                width={60}
                height={60}
                className="mr-2 w-7"
              />
              {svgIcons.find((option) => option.path === value)?.name || ""}
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
                height={200}
                itemCount={filteredOptions.length}
                itemSize={45}
                width="100%"
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
