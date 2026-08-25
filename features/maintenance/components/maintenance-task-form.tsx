"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { useGetAssets } from "@/features/assets/api/use-get-assets";
import { useGetVendors } from "@/features/vendors/api/use-get-vendors";

export const CATEGORY_OPTIONS = [
  { value: "hvac", label: "HVAC" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "appliance", label: "Appliance" },
  { value: "exterior", label: "Exterior (gutters, roof, siding)" },
  { value: "safety", label: "Safety (smoke detectors, extinguishers)" },
  { value: "landscaping", label: "Landscaping" },
  { value: "other", label: "Other" },
] as const;

export const FREQUENCY_OPTIONS = [
  { value: "none", label: "One-off (no repeat)" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "biannual", label: "Every 6 months" },
  { value: "annual", label: "Yearly" },
  { value: "custom_days", label: "Custom interval" },
] as const;

export const maintenanceTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  category: z.enum([
    "hvac",
    "plumbing",
    "electrical",
    "appliance",
    "exterior",
    "safety",
    "landscaping",
    "other",
  ]),
  assetId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  frequency: z.enum([
    "none",
    "monthly",
    "quarterly",
    "biannual",
    "annual",
    "custom_days",
  ]),
  customIntervalDays: z.number().int().positive().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type MaintenanceTaskFormValues = z.infer<
  typeof maintenanceTaskFormSchema
>;

type Props = {
  defaultValues?: Partial<MaintenanceTaskFormValues>;
  onSubmit: (values: MaintenanceTaskFormValues) => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function MaintenanceTaskForm({
  defaultValues,
  onSubmit,
  disabled,
  submitLabel = "Save",
}: Props) {
  const { data: assets } = useGetAssets();
  const { data: vendors } = useGetVendors();

  const form = useForm<MaintenanceTaskFormValues>({
    resolver: zodResolver(maintenanceTaskFormSchema),
    defaultValues: {
      title: "",
      description: null,
      category: "other",
      assetId: null,
      vendorId: null,
      frequency: "none",
      customIntervalDays: null,
      dueDate: null,
      notes: null,
      ...defaultValues,
    },
  });

  const frequency = form.watch("frequency");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Replace HVAC filter"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
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
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
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
            name="assetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Asset{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No asset linked" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No asset linked</SelectItem>
                    {assets?.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
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
                      <SelectValue placeholder="No preferred vendor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No preferred vendor</SelectItem>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeats</FormLabel>
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
                    {FREQUENCY_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {frequency === "custom_days" && (
            <FormField
              control={form.control}
              name="customIntervalDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Every N days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="e.g. 90"
                      disabled={disabled}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value, 10) : null
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Next due{" "}
                <span className="text-muted-foreground">(optional)</span>
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Short note about this task"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
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
