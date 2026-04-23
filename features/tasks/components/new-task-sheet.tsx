import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateTask } from "@/features/tasks/api/use-create-task";
import { useGetTaskLists } from "@/features/tasks/api/use-get-task-lists";
import { useNewTask } from "@/features/tasks/hooks/use-new-task";

import TaskForm, { TaskFormValues } from "./task-form";

export default function NewTaskSheet() {
  const { isOpen, onClose, defaultListId, defaultStatus } = useNewTask();
  const mutation = useCreateTask();
  const { data: taskLists = [] } = useGetTaskLists();

  const onSubmit = (values: TaskFormValues) => {
    mutation.mutate(
      {
        ...values,
        description: values.description ?? null,
        dueDate: values.dueDate ?? null,
        parentId: null,
        calendarEventId: null,
        assignedTo: null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Task</SheetTitle>
          <SheetDescription>Add a new task to your list.</SheetDescription>
        </SheetHeader>
        <TaskForm
          taskLists={taskLists}
          defaultValues={{ listId: defaultListId ?? taskLists[0]?.id ?? "", status: defaultStatus ?? "todo" }}
          onSubmit={onSubmit}
          disabled={mutation.isPending}
        />
      </SheetContent>
    </Sheet>
  );
}
