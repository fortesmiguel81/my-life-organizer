"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import { cn } from "@/lib/utils";

const ICONS = [
  "✅", "💪", "🏃", "📚", "💧", "🧘", "🥗", "😴",
  "🎯", "🧠", "🎨", "🎵", "💊", "🛏️", "🚴", "🏋️",
  "🌟", "📝", "🍎", "☕", "🧹", "🐕", "🌿", "🙏",
];

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#64748b",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const habitFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  icon: z.string().default("✅"),
  color: z.string().default("#6366f1"),
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
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      title: "",
      description: null,
      icon: "✅",
      color: "#6366f1",
      frequency: "daily",
      targetDays: null,
      reminderTime: null,
      ...defaultValues,
    },
  });

  const frequency = form.watch("frequency");
  const targetDays = form.watch("targetDays") ?? 127;
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
              <FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
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

        {/* Icon picker */}
        <FormField
          control={form.control}
          name="icon"
          render={() => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    disabled={disabled}
                    onClick={() => form.setValue("icon", emoji)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md border text-lg transition-colors",
                      selectedIcon === emoji
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color picker */}
        <FormField
          control={form.control}
          name="color"
          render={() => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    disabled={disabled}
                    onClick={() => form.setValue("color", color)}
                    style={{ backgroundColor: color }}
                    className={cn(
                      "size-7 rounded-full border-2 transition-transform",
                      selectedColor === color
                        ? "scale-125 border-foreground"
                        : "border-transparent hover:scale-110"
                    )}
                  />
                ))}
              </div>
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

        {/* Day-of-week selector (always shown for daily too — skip days) */}
        <FormField
          control={form.control}
          name="targetDays"
          render={() => (
            <FormItem>
              <FormLabel>
                {frequency === "weekly" ? "Target days" : "Skip days"}
                <span className="ml-1 text-xs text-muted-foreground">
                  {frequency === "daily" ? "(leave all on for every day)" : ""}
                </span>
              </FormLabel>
              <div className="flex gap-1.5">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDay(i)}
                    style={isDaySelected(i) ? { backgroundColor: selectedColor } : undefined}
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

        {/* Reminder time */}
        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reminder time <span className="text-muted-foreground">(optional, UTC)</span></FormLabel>
              <FormControl>
                <Input
                  type="time"
                  disabled={disabled}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
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
