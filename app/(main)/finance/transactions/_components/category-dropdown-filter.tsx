'use client';

import {
  BookA,
  Car,
  Hospital,
  HousePlug,
  PlusCircle,
  Shirt,
  ShoppingCart,
  TvMinimalPlay,
  Utensils,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Dispatch, SetStateAction, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Category } from '../../types/category';

const categories: Category[] = [
  {
    value: 'Food',
    label: 'Food',
    icon: Utensils,
  },
  {
    value: 'Utilities',
    label: 'Utilities',
    icon: HousePlug,
  },
  {
    value: 'Transportation',
    label: 'Transportation',
    icon: Car,
  },
  {
    value: 'Entertainment',
    label: 'Entertainment',
    icon: TvMinimalPlay,
  },
  {
    value: 'Healthcare',
    label: 'Healthcare',
    icon: Hospital,
  },
  {
    value: 'Shopping',
    label: 'Shopping',
    icon: ShoppingCart,
  },
  {
    value: 'Education',
    label: 'Education',
    icon: BookA,
  },
  {
    value: 'Clothing',
    label: 'Clothing',
    icon: Shirt,
  },
];

interface CategoryDropdownFilterProps {
  selectedCategories: Category[];
  setSelectedCategories: Dispatch<SetStateAction<Category[]>>;
}

export function CategoryDropdownFilter({
  selectedCategories,
  setSelectedCategories,
}: CategoryDropdownFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className='flex h-full items-center space-x-4'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='flex h-10 items-center justify-start border-dashed leading-none'
          >
            <div className='flex items-center text-sm leading-none'>
              <PlusCircle className='mr-2 h-4 w-4 shrink-0' />
              <span>Category</span>
            </div>
            {selectedCategories.length > 0 && (
              <>
                <Separator
                  orientation='vertical'
                  className='mx-2 h-4 w-[1px] shrink-0 bg-border'
                />
                <div className='flex items-center gap-2'>
                  {selectedCategories.length >= 3 ? (
                    <Badge
                      variant='secondary'
                      className='rounded-sm py-1 text-sm leading-none'
                    >
                      {selectedCategories.length} selected
                    </Badge>
                  ) : (
                    selectedCategories.map((category) => (
                      <Badge
                        key={category.value}
                        variant='secondary'
                        className='rounded-sm py-1 text-sm leading-none'
                      >
                        {category.value}
                      </Badge>
                    ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0' side='bottom' align='start'>
          <Command>
            <CommandInput placeholder='Change status...' />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CommandItem key={category.value} value={category.value}>
                    <div className='flex h-6 items-center space-x-2'>
                      <Checkbox
                        id={category.value}
                        onCheckedChange={() => {
                          setSelectedCategories((prevSelectedCategories) => {
                            const isAlreadySelected =
                              prevSelectedCategories?.some(
                                (s) => s.value === category.value
                              );
                            if (isAlreadySelected) {
                              return prevSelectedCategories.filter(
                                (s) => s.value !== category.value
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
                      <category.icon className='h-4 w-4 shrink-0' />
                      <label
                        htmlFor={category.value}
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        {category.value}
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
