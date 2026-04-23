import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateTaskList } from "@/features/tasks/api/use-create-task-list";
import { useNewTaskList } from "@/features/tasks/hooks/use-new-task-list";

import TaskListForm, { TaskListFormValues } from "./task-list-form";

export default function NewTaskListSheet() {
  const { isOpen, onClose } = useNewTaskList();
  const mutation = useCreateTaskList();

  const onSubmit = (values: TaskListFormValues) => {
    mutation.mutate(values, { onSuccess: onClose });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New List</SheetTitle>
          <SheetDescription>Create a new task list.</SheetDescription>
        </SheetHeader>
        <TaskListForm onSubmit={onSubmit} disabled={mutation.isPending} />
      </SheetContent>
    </Sheet>
  );
}
