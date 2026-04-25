"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { TimePicker } from "@/components/time-picker";
import { cn } from "@/lib/utils";

const NOTIFY_OPTIONS = [
  { label: "None", value: "0" },
  { label: "15 minutes before", value: "15" },
  { label: "30 minutes before", value: "30" },
  { label: "1 hour before", value: "60" },
  { label: "1 day before", value: "1440" },
];

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startDate: z.date({ required_error: "Start date is required" }),
    endDate: z.date({ required_error: "End date is required" }),
    allDay: z.boolean().default(false),
    location: z.string().optional(),
    color: z.string().optional(),
    notifyBefore: z.number().int().min(0).default(30),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type EventFormValues = z.infer<typeof formSchema>;

type Props = {
  id?: string;
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  onDelete?: () => void;
  onExport?: () => void;
  disabled?: boolean;
};

export default function EventForm({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  onExport,
  disabled,
}: Props) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      allDay: false,
      location: "",
      color: "",
      notifyBefore: 30,
      ...defaultValues,
    },
  });

  const allDay = form.watch("allDay");

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
                <Input placeholder="Doctor appointment" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* All-day toggle */}
        <FormField
          control={form.control}
          name="allDay"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormLabel className="mt-0 cursor-pointer">All day</FormLabel>
            </FormItem>
          )}
        />

        {/* Start date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start</FormLabel>
              <DateTimeInput
                value={field.value}
                onChange={field.onChange}
                allDay={allDay}
                disabled={disabled}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End date */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End</FormLabel>
              <DateTimeInput
                value={field.value}
                onChange={field.onChange}
                allDay={allDay}
                disabled={disabled}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" disabled={disabled} {...field} />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes..."
                  rows={3}
                  disabled={disabled}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notify before */}
        <FormField
          control={form.control}
          name="notifyBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email reminder</FormLabel>
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NOTIFY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create event"}
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
            Delete event
          </Button>
        )}

        {id && onExport && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onExport}
          >
            <Download className="mr-2 size-4" />
            Export .ics
          </Button>
        )}
      </form>
    </Form>
  );
}

function DateTimeInput({
  value,
  onChange,
  allDay,
  disabled,
}: {
  value?: Date;
  onChange: (d: Date) => void;
  allDay: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? format(value, "MMM d, yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(d) => {
              if (!d) return;
              const next = value ? new Date(value) : new Date(d);
              next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate());
              onChange(next);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {!allDay && (
        <TimePicker value={value} onChange={onChange} disabled={disabled} />
      )}
    </div>
  );
}
