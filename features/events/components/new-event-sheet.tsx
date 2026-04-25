import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateEvent } from "@/features/events/api/use-create-event";
import { useNewEvent } from "@/features/events/hooks/use-new-event";

import EventForm, { EventFormValues } from "./event-form";

export default function NewEventSheet() {
  const { isOpen, onClose, defaultStart, defaultEnd, defaultTitle, defaultDescription } = useNewEvent();
  const mutation = useCreateEvent();

  const onSubmit = (values: EventFormValues) => {
    mutation.mutate(
      {
        ...values,
        description: values.description ?? null,
        location: values.location ?? null,
        color: values.color ?? null,
      },
      { onSuccess: onClose }
    );
  };

  const defaultValues = {
    ...(defaultStart && { startDate: defaultStart }),
    ...(defaultEnd && { endDate: defaultEnd ?? defaultStart }),
    ...(defaultTitle && { title: defaultTitle }),
    ...(defaultDescription && { description: defaultDescription }),
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Event</SheetTitle>
          <SheetDescription>Schedule a new event on your calendar.</SheetDescription>
        </SheetHeader>
        <EventForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={defaultValues}
        />
      </SheetContent>
    </Sheet>
  );
}
