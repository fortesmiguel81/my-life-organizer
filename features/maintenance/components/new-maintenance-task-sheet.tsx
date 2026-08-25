"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateMaintenanceTask } from "@/features/maintenance/api/use-create-maintenance-task";
import { useNewMaintenanceTask } from "@/features/maintenance/hooks/use-new-maintenance-task";

import MaintenanceTaskForm, {
  MaintenanceTaskFormValues,
} from "./maintenance-task-form";

export default function NewMaintenanceTaskSheet() {
  const { isOpen, onClose } = useNewMaintenanceTask();
  const mutation = useCreateMaintenanceTask();

  const onSubmit = (values: MaintenanceTaskFormValues) => {
    mutation.mutate(
      {
        title: values.title,
        description: values.description || null,
        category: values.category,
        assetId: values.assetId || null,
        vendorId: values.vendorId || null,
        frequency: values.frequency,
        customIntervalDays: values.customIntervalDays ?? null,
        dueDate: values.dueDate ?? null,
        notes: values.notes || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New maintenance task</SheetTitle>
          <SheetDescription>
            Track a recurring or one-off maintenance item with due-date alerts.
          </SheetDescription>
        </SheetHeader>
        <MaintenanceTaskForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          submitLabel="Add task"
        />
      </SheetContent>
    </Sheet>
  );
}
