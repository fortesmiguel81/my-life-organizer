import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteTaskList } from "@/features/tasks/api/use-delete-task-list";
import { useEditTaskList } from "@/features/tasks/api/use-edit-task-list";
import { useGetTaskLists } from "@/features/tasks/api/use-get-task-lists";
import { useOpenTaskList } from "@/features/tasks/hooks/use-open-task-list";
import { useConfirm } from "@/hooks/use-confirm";

import TaskListForm, { TaskListFormValues } from "./task-list-form";

export default function EditTaskListSheet() {
  const { isOpen, onClose, id } = useOpenTaskList();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "This will permanently delete the list and all its tasks."
  );

  const listsQuery = useGetTaskLists();
  const editMutation = useEditTaskList(id);
  const deleteMutation = useDeleteTaskList(id);

  const list = listsQuery.data?.find((l) => l.id === id);

  const defaultValues: TaskListFormValues | undefined = list
    ? { name: list.name, icon: list.icon ?? "", color: list.color ?? "" }
    : undefined;

  const onSubmit = (values: TaskListFormValues) => {
    editMutation.mutate(values, { onSuccess: onClose });
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit List</SheetTitle>
            <SheetDescription>Update the name, icon, or colour of this list.</SheetDescription>
          </SheetHeader>
          <TaskListForm
            id={id}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onDelete={onDelete}
            disabled={editMutation.isPending || deleteMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
