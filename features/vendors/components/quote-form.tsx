"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import BudgetInput from "@/components/budget-input";
import DatePicker from "@/components/date-picker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const quoteFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().optional(),
  status: z.enum(["pending", "accepted", "declined", "expired"]),
  quoteDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

type Props = {
  defaultValues?: Partial<QuoteFormValues>;
  onSubmit: (values: QuoteFormValues) => void;
  onCancel: () => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function QuoteForm({
  defaultValues,
  onSubmit,
  onCancel,
  disabled,
  submitLabel = "Save quote",
}: Props) {
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      status: "pending",
      quoteDate: null,
      notes: null,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3 rounded-lg border bg-muted/30 p-3"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Water heater replacement"
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <BudgetInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    disabled={disabled}
                    placeholder="0.00"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="quoteDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Date <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ?? undefined}
                  onChange={(d) => field.onChange(d ?? null)}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes…"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            size="sm"
            disabled={disabled}
            className="flex-1"
          >
            {submitLabel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={disabled}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function amountToInputValue(miliunits: number | null | undefined) {
  if (miliunits === null || miliunits === undefined) return "";
  return Math.abs(convertAmountFromMiliunits(miliunits)).toString();
}
