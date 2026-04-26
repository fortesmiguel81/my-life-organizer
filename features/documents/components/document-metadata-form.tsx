"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import DatePicker from "@/components/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = ["legal", "insurance", "medical", "household", "financial", "other"] as const;

export const CATEGORY_LABELS: Record<typeof CATEGORIES[number], string> = {
  legal: "Legal",
  insurance: "Insurance",
  medical: "Medical",
  household: "Household",
  financial: "Financial",
  other: "Other",
};

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.enum(CATEGORIES).default("other"),
  tags: z.array(z.string()).default([]),
  expiryDate: z.date().nullable().optional(),
});

export type DocumentMetadataFormValues = z.infer<typeof formSchema>;

type Props = {
  defaultValues?: Partial<DocumentMetadataFormValues>;
  onSubmit: (values: DocumentMetadataFormValues) => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function DocumentMetadataForm({ defaultValues, onSubmit, disabled, submitLabel = "Save" }: Props) {
  const [tagInput, setTagInput] = useState("");

  const form = useForm<DocumentMetadataFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "other",
      tags: [],
      expiryDate: null,
      ...defaultValues,
    },
  });

  const tags = form.watch("tags");

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      form.setValue("tags", [...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    form.setValue("tags", tags.filter((t) => t !== tag));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document name</FormLabel>
              <Input placeholder="e.g. Home insurance policy 2026" disabled={disabled} {...field} />
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <Textarea placeholder="Optional notes about this document…" disabled={disabled} {...field} />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              disabled={disabled}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag} disabled={disabled}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 rounded-sm hover:bg-muted">
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </FormItem>

        <FormField
          control={form.control}
          name="expiryDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry date <span className="text-muted-foreground">(optional)</span></FormLabel>
              <DatePicker
                value={field.value ?? undefined}
                onChange={(day) => field.onChange(day ?? null)}
                disabled={disabled}
              />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}
