"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["produce", "dairy", "meat", "bakery", "household", "other"] as const;

const formSchema = z.object({
  listId: z.string().min(1, "List is required"),
  name: z.string().min(1, "Name is required"),
  quantity: z.coerce.number().positive().default(1),
  unit: z.string().optional(),
  category: z.enum(CATEGORIES).default("other"),
  estimatedPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  note: z.string().optional(),
});

export type ShoppingItemFormValues = z.infer<typeof formSchema>;

type ListOption = { id: string; name: string; icon?: string | null };

type Props = {
  id?: string;
  lists: ListOption[];
  defaultValues?: Partial<ShoppingItemFormValues>;
  onSubmit: (values: ShoppingItemFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

const CATEGORY_LABELS: Record<typeof CATEGORIES[number], string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat: "Meat",
  bakery: "Bakery",
  household: "Household",
  other: "Other",
};

export default function ShoppingItemForm({ id, lists, defaultValues, onSubmit, onDelete, disabled }: Props) {
  const form = useForm<ShoppingItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listId: "",
      name: "",
      quantity: 1,
      unit: "",
      category: "other",
      estimatedPrice: null,
      note: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="listId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>List</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.icon} {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item name</FormLabel>
              <Input placeholder="e.g. Whole milk" disabled={disabled} {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <Input type="number" step="0.1" min="0" disabled={disabled} {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Input placeholder="kg, L, pcs…" disabled={disabled} {...field} />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated price (cents)</FormLabel>
              <Input
                type="number"
                min="0"
                placeholder="e.g. 299 for $2.99"
                disabled={disabled}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.valueAsNumber)}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <Textarea placeholder="Any details…" disabled={disabled} {...field} />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Add item"}
        </Button>

        {id && onDelete && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled}
            onClick={onDelete}
          >
            <Trash2 className="mr-2 size-4" />
            Delete item
          </Button>
        )}
      </form>
    </Form>
  );
}
