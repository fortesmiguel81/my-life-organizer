"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { EmojiClickData, Theme } from "emoji-picker-react";
import { Trash2 } from "lucide-react";
import { useTheme } from "next-themes";
import { ColorPicker, IColor, useColor } from "react-color-palette";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const DEFAULT_COLOR = "#3b82f6";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export type TaskListFormValues = z.infer<typeof formSchema>;

type Props = {
  id?: string;
  defaultValues?: Partial<TaskListFormValues>;
  onSubmit: (values: TaskListFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export default function TaskListForm({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: Props) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const form = useForm<TaskListFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: "",
      color: DEFAULT_COLOR,
      ...defaultValues,
    },
  });

  const selectedIcon = form.watch("icon");
  const [color, setColor] = useColor(defaultValues?.color ?? DEFAULT_COLOR);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <Input placeholder="Home tasks" disabled={disabled} {...field} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
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
                      <span className="text-muted-foreground">
                        Pick an emoji…
                      </span>
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

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <ColorPicker
                color={color}
                onChange={(newColor: IColor) => {
                  setColor(newColor);
                  field.onChange(newColor.hex);
                }}
              />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create list"}
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
            Delete list
          </Button>
        )}
      </form>
    </Form>
  );
}
