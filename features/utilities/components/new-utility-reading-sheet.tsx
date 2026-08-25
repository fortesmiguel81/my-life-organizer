"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateUtilityReading } from "@/features/utilities/api/use-create-utility-reading";
import { useNewUtilityReading } from "@/features/utilities/hooks/use-new-utility-reading";
import { convertAmountToMiliunits } from "@/lib/utils";

import UtilityReadingForm, {
  UtilityReadingFormValues,
} from "./utility-reading-form";

export default function NewUtilityReadingSheet() {
  const { isOpen, onClose } = useNewUtilityReading();
  const mutation = useCreateUtilityReading();

  const onSubmit = (values: UtilityReadingFormValues) => {
    mutation.mutate(
      {
        utilityType: values.utilityType,
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        usage: values.usage,
        unit: values.unit,
        cost: values.cost
          ? convertAmountToMiliunits(parseFloat(values.cost))
          : null,
        notes: values.notes || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New utility reading</SheetTitle>
          <SheetDescription>
            Log a billing period&apos;s electricity, water, or gas usage.
          </SheetDescription>
        </SheetHeader>
        <UtilityReadingForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          submitLabel="Add reading"
        />
      </SheetContent>
    </Sheet>
  );
}
