import Spinner from "@/components/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteTask } from "@/features/tasks/api/use-delete-task";
import { useEditTask } from "@/features/tasks/api/use-edit-task";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { useGetTaskLists } from "@/features/tasks/api/use-get-task-lists";
import { useOpenTask } from "@/features/tasks/hooks/use-open-task";
import { useConfirm } from "@/hooks/use-confirm";

import TaskForm, { TaskFormValues } from "./task-form";

export default function EditTaskSheet() {
  const { id, isOpen, onClose } = useOpenTask();
  const taskQuery = useGetTask(id);
  const editMutation = useEditTask(id);
  const deleteMutation = useDeleteTask(id);
  const { data: taskLists = [] } = useGetTaskLists();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task?",
    "This cannot be undone."
  );

  const isPending = editMutation.isPending || deleteMutation.isPending;

  const onSubmit = (values: TaskFormValues) => {
    editMutation.mutate(
      {
        ...values,
        description: values.description ?? null,
        dueDate: values.dueDate ?? null,
        assignedTo: values.assignedTo ?? null,
      },
      { onSuccess: onClose }
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  const raw = taskQuery.data;
  const defaultValues: Partial<TaskFormValues> | undefined = raw
    ? {
        listId: raw.listId,
        title: raw.title,
        description: raw.description ?? "",
        status: raw.status,
        priority: raw.priority,
        dueDate: raw.dueDate ? new Date(raw.dueDate) : null,
        assignedTo: raw.assignedTo ?? "",
      }
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Task</SheetTitle>
            <SheetDescription>Update the task details.</SheetDescription>
          </SheetHeader>
          {taskQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="icon" />
            </div>
          ) : (
            <TaskForm
              id={id}
              taskLists={taskLists}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
