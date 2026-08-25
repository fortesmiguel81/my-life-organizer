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

export const UTILITY_TYPE_OPTIONS = [
  { value: "electricity", label: "Electricity", defaultUnit: "kWh" },
  { value: "water", label: "Water", defaultUnit: "gal" },
  { value: "gas", label: "Gas", defaultUnit: "therms" },
  { value: "other", label: "Other", defaultUnit: "units" },
] as const;

export const utilityReadingFormSchema = z
  .object({
    utilityType: z.enum(["electricity", "water", "gas", "other"]),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    usage: z.coerce.number().positive("Usage must be greater than 0"),
    unit: z.string().min(1, "Unit is required"),
    cost: z.string().optional(),
    notes: z.string().optional().nullable(),
  })
  .refine((v) => v.periodEnd >= v.periodStart, {
    message: "End date must be on or after the start date",
    path: ["periodEnd"],
  });

export type UtilityReadingFormValues = z.infer<typeof utilityReadingFormSchema>;

type Props = {
  defaultValues?: Partial<UtilityReadingFormValues>;
  onSubmit: (values: UtilityReadingFormValues) => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function UtilityReadingForm({
  defaultValues,
  onSubmit,
  disabled,
  submitLabel = "Save",
}: Props) {
  const form = useForm<UtilityReadingFormValues>({
    resolver: zodResolver(utilityReadingFormSchema),
    defaultValues: {
      utilityType: "electricity",
      periodStart: undefined,
      periodEnd: undefined,
      usage: undefined,
      unit: "kWh",
      cost: "",
      notes: null,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="utilityType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utility</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  const option = UTILITY_TYPE_OPTIONS.find(
                    (o) => o.value === v
                  );
                  if (option) form.setValue("unit", option.defaultUnit);
                }}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {UTILITY_TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="periodStart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period start</FormLabel>
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
          <FormField
            control={form.control}
            name="periodEnd"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Period end</FormLabel>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="usage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    placeholder="0"
                    disabled={disabled}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : ""
                      )
                    }
                  />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="kWh" disabled={disabled} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <Button type="submit" disabled={disabled} className="w-full">
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
