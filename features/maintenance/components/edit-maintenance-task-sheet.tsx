"use client";

import { useState } from "react";

import { CheckCircle2, Pencil, Trash2 } from "lucide-react";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteMaintenanceLog } from "@/features/maintenance/api/use-delete-maintenance-log";
import { useDeleteMaintenanceTask } from "@/features/maintenance/api/use-delete-maintenance-task";
import { useEditMaintenanceTask } from "@/features/maintenance/api/use-edit-maintenance-task";
import { useGetMaintenanceTask } from "@/features/maintenance/api/use-get-maintenance-task";
import { useLogMaintenanceCompletion } from "@/features/maintenance/api/use-log-maintenance-completion";
import LogCompletionForm, {
  LogCompletionFormValues,
} from "@/features/maintenance/components/log-completion-form";
import MaintenanceTaskForm, {
  CATEGORY_OPTIONS,
  FREQUENCY_OPTIONS,
  MaintenanceTaskFormValues,
} from "@/features/maintenance/components/maintenance-task-form";
import { useOpenMaintenanceTask } from "@/features/maintenance/hooks/use-open-maintenance-task";
import { useConfirm } from "@/hooks/use-confirm";
import {
  convertAmountFromMiliunits,
  convertAmountToMiliunits,
  formatCurrency,
} from "@/lib/utils";

function LogRow({
  log,
  taskId,
}: {
  log: {
    id: string;
    completedDate: string | Date;
    vendorName: string | null;
    cost: number | null;
    notes: string | null;
  };
  taskId: string;
}) {
  const deleteMutation = useDeleteMaintenanceLog(log.id, taskId);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete log entry",
    "This will permanently delete this completion record."
  );

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate();
  };

  return (
    <>
      <ConfirmDialog />
      <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {new Date(log.completedDate).toLocaleDateString()}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {log.vendorName && <span>{log.vendorName}</span>}
            {log.cost != null && (
              <span>
                {formatCurrency(convertAmountFromMiliunits(log.cost))}
              </span>
            )}
          </div>
          {log.notes && (
            <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
          )}
        </div>
        <button
          onClick={onDelete}
          disabled={deleteMutation.isPending}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </>
  );
}

export default function EditMaintenanceTaskSheet() {
  const { id, isOpen, onClose } = useOpenMaintenanceTask();
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [isLoggingCompletion, setIsLoggingCompletion] = useState(false);

  const taskQuery = useGetMaintenanceTask(id);
  const editMutation = useEditMaintenanceTask(id!);
  const deleteMutation = useDeleteMaintenanceTask(id!);
  const logMutation = useLogMaintenanceCompletion(id!);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete maintenance task",
    "This will permanently delete this task and its completion history."
  );

  const task = taskQuery.data;

  const handleClose = () => {
    setIsEditingTask(false);
    setIsLoggingCompletion(false);
    onClose();
  };

  const onSaveTask = (values: MaintenanceTaskFormValues) => {
    editMutation.mutate(
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
      { onSuccess: () => setIsEditingTask(false) }
    );
  };

  const onDeleteTask = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: handleClose });
  };

  const onLogCompletion = (values: LogCompletionFormValues) => {
    logMutation.mutate(
      {
        taskId: id!,
        completedDate: values.completedDate,
        vendorId: values.vendorId || null,
        cost: values.cost
          ? convertAmountToMiliunits(parseFloat(values.cost))
          : null,
        notes: values.notes || null,
      },
      { onSuccess: () => setIsLoggingCompletion(false) }
    );
  };

  const categoryLabel = task
    ? CATEGORY_OPTIONS.find((c) => c.value === task.category)?.label
    : undefined;
  const frequencyLabel = task
    ? FREQUENCY_OPTIONS.find((f) => f.value === task.frequency)?.label
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="space-y-4 overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{task?.title ?? "Maintenance task"}</SheetTitle>
            <SheetDescription>
              {isEditingTask
                ? "Edit task details."
                : "Task details and completion history."}
            </SheetDescription>
          </SheetHeader>

          {taskQuery.isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="icon" />
            </div>
          )}

          {task && isEditingTask && (
            <MaintenanceTaskForm
              defaultValues={{
                title: task.title,
                description: task.description,
                category: task.category,
                assetId: task.assetId,
                vendorId: task.vendorId,
                frequency: task.frequency,
                customIntervalDays: task.customIntervalDays,
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                notes: task.notes,
              }}
              onSubmit={onSaveTask}
              disabled={editMutation.isPending}
              submitLabel="Save changes"
            />
          )}

          {task && !isEditingTask && (
            <>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{categoryLabel}</Badge>
                    <Badge variant="outline">{frequencyLabel}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsEditingTask(true)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={onDeleteTask}
                      disabled={deleteMutation.isPending}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                {task.dueDate && (
                  <p className="text-sm">
                    Next due:{" "}
                    <span className="font-medium">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </p>
                )}
                {task.assetName && (
                  <p className="text-sm text-muted-foreground">
                    Asset: {task.assetName}
                  </p>
                )}
                {task.vendorName && (
                  <p className="text-sm text-muted-foreground">
                    Preferred vendor: {task.vendorName}
                  </p>
                )}
                {task.description && (
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                )}
                {task.notes && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {task.notes}
                  </p>
                )}
              </div>

              {!isLoggingCompletion && (
                <Button
                  onClick={() => setIsLoggingCompletion(true)}
                  className="w-full"
                  variant="outline"
                >
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Mark as completed
                </Button>
              )}

              {isLoggingCompletion && (
                <LogCompletionForm
                  defaultValues={{ vendorId: task.vendorId }}
                  onSubmit={onLogCompletion}
                  onCancel={() => setIsLoggingCompletion(false)}
                  disabled={logMutation.isPending}
                  submitLabel="Log completion"
                />
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Completion history</h3>
                </div>

                {task.logs.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No completions logged yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {task.logs.map((log) => (
                      <LogRow key={log.id} log={log} taskId={id!} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
