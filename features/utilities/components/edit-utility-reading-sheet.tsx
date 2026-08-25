"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteUtilityReading } from "@/features/utilities/api/use-delete-utility-reading";
import { useEditUtilityReading } from "@/features/utilities/api/use-edit-utility-reading";
import { useGetUtilityReadings } from "@/features/utilities/api/use-get-utility-readings";
import { useOpenUtilityReading } from "@/features/utilities/hooks/use-open-utility-reading";
import { useConfirm } from "@/hooks/use-confirm";
import {
  convertAmountFromMiliunits,
  convertAmountToMiliunits,
} from "@/lib/utils";

import UtilityReadingForm, {
  UtilityReadingFormValues,
} from "./utility-reading-form";

function amountToInputValue(miliunits: number | null | undefined) {
  if (miliunits === null || miliunits === undefined) return "";
  return Math.abs(convertAmountFromMiliunits(miliunits)).toString();
}

export default function EditUtilityReadingSheet() {
  const { id, isOpen, onClose } = useOpenUtilityReading();
  const readingsQuery = useGetUtilityReadings();
  const editMutation = useEditUtilityReading(id!);
  const deleteMutation = useDeleteUtilityReading(id!);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete reading",
    "This will permanently delete this utility reading."
  );

  const reading = readingsQuery.data?.find((r) => r.id === id);

  const onSubmit = (values: UtilityReadingFormValues) => {
    editMutation.mutate(
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

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  const isPending = editMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit reading</SheetTitle>
            <SheetDescription>
              Update this utility reading&apos;s details.
            </SheetDescription>
          </SheetHeader>
          {reading && (
            <UtilityReadingForm
              defaultValues={{
                utilityType: reading.utilityType,
                periodStart: new Date(reading.periodStart),
                periodEnd: new Date(reading.periodEnd),
                usage: reading.usage,
                unit: reading.unit,
                cost: amountToInputValue(reading.cost),
                notes: reading.notes,
              }}
              onSubmit={onSubmit}
              disabled={isPending}
              submitLabel="Save changes"
            />
          )}
          <button
            type="button"
            onClick={onDelete}
            disabled={isPending}
            className="w-full rounded-md border border-destructive py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          >
            Delete reading
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
