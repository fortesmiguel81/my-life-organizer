import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteTaskList } from "@/features/tasks/api/use-delete-task-list";
import { useEditTaskList } from "@/features/tasks/api/use-edit-task-list";
import { useConfirm } from "@/hooks/use-confirm";

import TaskListForm, { TaskListFormValues } from "./task-list-form";

type Props = {
  id?: string;
  name?: string;
  icon?: string | null;
  color?: string | null;
  isOpen: boolean;
  onClose: () => void;
};

export default function EditTaskListSheet({ id, name, icon, color, isOpen, onClose }: Props) {
  const editMutation = useEditTaskList(id);
  const deleteMutation = useDeleteTaskList(id);
  const [ConfirmDialog, confirm] = useConfirm("Delete list?", "This will delete all tasks in this list.");

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
            <SheetDescription>Rename or recolor this list.</SheetDescription>
          </SheetHeader>
          <TaskListForm
            id={id}
            defaultValues={{ name: name ?? "", icon: icon ?? "", color: color ?? "" }}
            onSubmit={onSubmit}
            onDelete={onDelete}
            disabled={editMutation.isPending || deleteMutation.isPending}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
