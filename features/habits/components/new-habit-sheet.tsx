"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateHabit } from "@/features/habits/api/use-create-habit";
import { useNewHabit } from "@/features/habits/hooks/use-new-habit";

import HabitForm, { HabitFormValues } from "./habit-form";

export default function NewHabitSheet() {
  const { isOpen, onClose } = useNewHabit();
  const mutation = useCreateHabit();

  const onSubmit = (values: HabitFormValues) => {
    mutation.mutate(
      {
        title: values.title,
        description: values.description ?? null,
        icon: values.icon ?? "✅",
        color: values.color ?? "#6366f1",
        frequency: values.frequency,
        targetDays: values.targetDays ?? null,
        reminderTime: values.reminderTime ?? null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New habit</SheetTitle>
          <SheetDescription>Track a new daily or weekly habit.</SheetDescription>
        </SheetHeader>
        <HabitForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          submitLabel="Create habit"
        />
      </SheetContent>
    </Sheet>
  );
}
