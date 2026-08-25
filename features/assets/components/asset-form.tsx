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
import { useGetDocuments } from "@/features/documents/api/use-get-documents";

export const CATEGORY_OPTIONS = [
  { value: "appliance", label: "Appliance" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
  { value: "hvac", label: "HVAC" },
  { value: "vehicle", label: "Vehicle" },
  { value: "tool", label: "Tool" },
  { value: "other", label: "Other" },
] as const;

export const assetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum([
    "appliance",
    "electronics",
    "furniture",
    "hvac",
    "vehicle",
    "tool",
    "other",
  ]),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  purchaseDate: z.coerce.date().optional().nullable(),
  purchasePrice: z.string().optional(),
  insuranceValue: z.string().optional(),
  warrantyExpiration: z.coerce.date().optional().nullable(),
  manualDocumentId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

type Props = {
  defaultValues?: Partial<AssetFormValues>;
  onSubmit: (values: AssetFormValues) => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function AssetForm({
  defaultValues,
  onSubmit,
  disabled,
  submitLabel = "Save",
}: Props) {
  const { data: documents } = useGetDocuments();

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      category: "other",
      brand: null,
      model: null,
      serialNumber: null,
      location: null,
      purchaseDate: null,
      purchasePrice: "",
      insuranceValue: "",
      warrantyExpiration: null,
      manualDocumentId: null,
      notes: null,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Kitchen refrigerator"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Location{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Kitchen"
                    disabled={disabled}
                    {...field}
                    value={field.value ?? ""}
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
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Brand{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
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
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Model{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={disabled}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serialNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Serial number{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Purchase date{" "}
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
            name="warrantyExpiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Warranty expires{" "}
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Purchase price{" "}
                  <span className="text-muted-foreground">(optional)</span>
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
            name="insuranceValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Insurance value{" "}
                  <span className="text-muted-foreground">(optional)</span>
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
          name="manualDocumentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Manual{" "}
                <span className="text-muted-foreground">
                  (optional — pick from your uploaded documents)
                </span>
              </FormLabel>
              <Select
                value={field.value ?? "none"}
                onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="No manual linked" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No manual linked</SelectItem>
                  {documents?.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.name}
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
