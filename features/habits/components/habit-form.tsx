"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { EmojiClickData, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { ColorPicker, IColor, useColor } from "react-color-palette";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TimePicker } from "@/components/time-picker";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const DEFAULT_COLOR = "#6366f1";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function timeStrToDate(s: string | null | undefined): Date | undefined {
  if (!s) return undefined;
  const [h, m] = s.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  icon: z.string().default("✅"),
  color: z.string().default(DEFAULT_COLOR),
  frequency: z.enum(["daily", "weekly"]).default("daily"),
  targetDays: z.number().int().nullable().default(null),
  reminderTime: z.string().nullable().default(null),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;

type Props = {
  defaultValues?: Partial<HabitFormValues>;
  onSubmit: (values: HabitFormValues) => void;
  disabled?: boolean;
  submitLabel?: string;
};

export default function HabitForm({
  defaultValues,
  onSubmit,
  disabled,
  submitLabel = "Save",
}: Props) {
  const { resolvedTheme } = useTheme();
  const [emojiOpen, setEmojiOpen] = useState(false);

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: "",
      description: null,
      icon: "✅",
      color: DEFAULT_COLOR,
      frequency: "daily",
      targetDays: null,
      reminderTime: null,
      ...defaultValues,
    },
  });

  const [color, setColor] = useColor(defaultValues?.color ?? DEFAULT_COLOR);

  const frequency = form.watch("frequency");
  const selectedColor = form.watch("color");
  const selectedIcon = form.watch("icon");

  function toggleDay(bit: number) {
    const current = form.getValues("targetDays") ?? 127;
    const next = current ^ (1 << bit);
    form.setValue("targetDays", next === 127 ? null : next);
  }

  function isDaySelected(bit: number) {
    const val = form.getValues("targetDays");
    if (val === null) return true;
    return (val & (1 << bit)) !== 0;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Morning run" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
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
                  placeholder="Short note about this habit"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Icon — full emoji picker */}
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color — full color picker */}
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Frequency */}
        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
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
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (specific days)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Day-of-week bitmask */}
        <FormField
          control={form.control}
          name="targetDays"
          render={() => (
            <FormItem>
              <FormLabel>
                {frequency === "weekly" ? "Target days" : "Active days"}
                <span className="ml-1 text-xs text-muted-foreground">
                  (leave all on for every day)
                </span>
              </FormLabel>
              <div className="flex gap-1.5">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDay(i)}
                    style={
                      isDaySelected(i)
                        ? { backgroundColor: selectedColor }
                        : undefined
                    }
                    className={cn(
                      "flex h-8 w-9 items-center justify-center rounded-md border text-xs font-medium transition-colors",
                      isDaySelected(i)
                        ? "border-transparent text-white"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Reminder time — shared TimePicker */}
        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Reminder time{" "}
                <span className="text-muted-foreground">(optional, UTC)</span>
              </FormLabel>
              <div className="flex items-center gap-2">
                <TimePicker
                  value={timeStrToDate(field.value)}
                  onChange={(d) => field.onChange(dateToTimeStr(d))}
                  disabled={disabled}
                />
                {field.value && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => field.onChange(null)}
                    className="text-muted-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
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
