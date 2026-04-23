"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { EmojiClickData, Theme } from "emoji-picker-react";
import { Trash } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { insertCategorySchema } from "@/db/schema";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const formSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  icon: z.string(),
});

const apiSchema = insertCategorySchema.omit({
  id: true,
  userId: true,
  orgId: true,
  created_at: true,
  created_by: true,
  updated_at: true,
  updated_by: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.output<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export default function CategoryForm({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedIcon = form.watch("icon");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input disabled={disabled} placeholder="Add a name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Optional description"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="icon"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className="h-10 w-full justify-start gap-2 font-normal"
                  >
                    {selectedIcon ? (
                      <span className="text-xl">{selectedIcon}</span>
                    ) : (
                      <span className="text-muted-foreground">Pick an emoji…</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <EmojiPicker
                    theme={resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={(data: EmojiClickData) => {
                      field.onChange(data.emoji);
                      setEmojiOpen(false);
                    }}
                    searchPlaceholder="Search emoji…"
                    lazyLoadEmojis
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create category"}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="mr-2 size-4" />
            Delete category
          </Button>
        )}
      </form>
    </Form>
  );
}
