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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetVendors } from "@/features/vendors/api/use-get-vendors";
import { convertAmountFromMiliunits } from "@/lib/utils";

export const logCompletionFormSchema = z.object({
  completedDate: z.coerce.date(),
  vendorId: z.string().optional().nullable(),
  cost: z.string().optional(),
  notes: z.string().optional().nullable(),
});

export type LogCompletionFormValues = z.infer<typeof logCompletionFormSchema>;

type Props = {
  defaultValues?: Partial<LogCompletionFormValues>;
  onSubmit: (values: LogCompletionFormValues) => void;
  onCancel: () => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function LogCompletionForm({
  defaultValues,
  onSubmit,
  onCancel,
  disabled,
  submitLabel = "Save",
}: Props) {
  const { data: vendors } = useGetVendors();

  const form = useForm<LogCompletionFormValues>({
    resolver: zodResolver(logCompletionFormSchema),
    defaultValues: {
      completedDate: new Date(),
      vendorId: null,
      cost: "",
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
          name="completedDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Completed on</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={(d) => d && field.onChange(d)}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Vendor{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="DIY / no vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">DIY / no vendor</SelectItem>
                    {vendors?.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
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
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Cost <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
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
        </div>

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
                  placeholder="What was done…"
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
