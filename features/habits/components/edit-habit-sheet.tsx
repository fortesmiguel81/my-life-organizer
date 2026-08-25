"use client";

import { useEffect } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteHabit } from "@/features/habits/api/use-delete-habit";
import { useEditHabit } from "@/features/habits/api/use-edit-habit";
import { useGetHabits } from "@/features/habits/api/use-get-habits";
import { useOpenHabit } from "@/features/habits/hooks/use-open-habit";
import { useConfirm } from "@/hooks/use-confirm";

import HabitForm, { HabitFormValues } from "./habit-form";

export default function EditHabitSheet() {
  const { id, isOpen, onClose } = useOpenHabit();
  const habitsQuery = useGetHabits();
  const editMutation = useEditHabit(id!);
  const deleteMutation = useDeleteHabit(id!);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete habit",
    "This will permanently delete this habit and all its logs."
  );

  const habit = habitsQuery.data?.find((h) => h.id === id);

  const onSubmit = (values: HabitFormValues) => {
    editMutation.mutate(
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

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  const isPending = editMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit habit</SheetTitle>
            <SheetDescription>Update your habit details.</SheetDescription>
          </SheetHeader>
          {habit && (
            <HabitForm
              defaultValues={{
                title: habit.title,
                description: habit.description,
                icon: habit.icon ?? "✅",
                color: habit.color ?? "#6366f1",
                frequency: habit.frequency,
                targetDays: habit.targetDays,
                reminderTime: habit.reminderTime,
              }}
              onSubmit={onSubmit}
              disabled={isPending}
              submitLabel="Save changes"
            />
          )}
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="w-full rounded-md border border-destructive py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            Delete habit
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
