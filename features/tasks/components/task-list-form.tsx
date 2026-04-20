"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
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

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

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

export default function TaskListForm({ id, defaultValues, onSubmit, onDelete, disabled }: Props) {
  const form = useForm<TaskListFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", icon: "", color: COLORS[4], ...defaultValues },
  });

  const selectedColor = form.watch("color");

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
                <Input placeholder="Home tasks" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (emoji)</FormLabel>
              <FormControl>
                <Input placeholder="🏠" maxLength={2} disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => field.onChange(c)}
                      className="size-7 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: selectedColor === c ? "black" : "transparent",
                      }}
                    />
                  ))}
                </div>
              </FormControl>
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
