import Spinner from "@/components/spinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteEvent } from "@/features/events/api/use-delete-event";
import { useEditEvent } from "@/features/events/api/use-edit-event";
import { useGetEvent } from "@/features/events/api/use-get-event";
import { useOpenEvent } from "@/features/events/hooks/use-open-event";
import { useConfirm } from "@/hooks/use-confirm";

import EventForm, { EventFormValues } from "./event-form";

export default function EditEventSheet() {
  const { isOpen, onClose, id } = useOpenEvent();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete event?",
    "This cannot be undone."
  );

  const eventQuery = useGetEvent(id);
  const editMutation = useEditEvent(id);
  const deleteMutation = useDeleteEvent(id);

  const isPending = editMutation.isPending || deleteMutation.isPending;

  const onSubmit = (values: EventFormValues) => {
    editMutation.mutate(
      {
        ...values,
        description: values.description ?? null,
        location: values.location ?? null,
        color: values.color ?? null,
      },
      { onSuccess: onClose }
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  const raw = eventQuery.data;
  const defaultValues: Partial<EventFormValues> | undefined = raw
    ? {
        title: raw.title,
        description: raw.description ?? "",
        startDate: new Date(raw.startDate),
        endDate: new Date(raw.endDate),
        allDay: raw.allDay,
        location: raw.location ?? "",
        color: raw.color ?? "",
        notifyBefore: raw.notifyBefore ?? 30,
      }
    : undefined;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Event</SheetTitle>
            <SheetDescription>Update the event details.</SheetDescription>
          </SheetHeader>
          {eventQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="icon" />
            </div>
          ) : (
            <EventForm
              id={id}
              onSubmit={onSubmit}
              onDelete={onDelete}
              disabled={isPending}
              defaultValues={defaultValues}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
