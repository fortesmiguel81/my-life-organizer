"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateAsset } from "@/features/assets/api/use-create-asset";
import { useNewAsset } from "@/features/assets/hooks/use-new-asset";
import { convertAmountToMiliunits } from "@/lib/utils";

import AssetForm, { AssetFormValues } from "./asset-form";

export default function NewAssetSheet() {
  const { isOpen, onClose } = useNewAsset();
  const mutation = useCreateAsset();

  const onSubmit = (values: AssetFormValues) => {
    mutation.mutate(
      {
        name: values.name,
        category: values.category,
        brand: values.brand || null,
        model: values.model || null,
        serialNumber: values.serialNumber || null,
        location: values.location || null,
        purchaseDate: values.purchaseDate ?? null,
        purchasePrice: values.purchasePrice
          ? convertAmountToMiliunits(parseFloat(values.purchasePrice))
          : null,
        insuranceValue: values.insuranceValue
          ? convertAmountToMiliunits(parseFloat(values.insuranceValue))
          : null,
        warrantyExpiration: values.warrantyExpiration ?? null,
        manualDocumentId: values.manualDocumentId || null,
        notes: values.notes || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New asset</SheetTitle>
          <SheetDescription>
            Track a home device, appliance, or valuable with its warranty and
            manual.
          </SheetDescription>
        </SheetHeader>
        <AssetForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          submitLabel="Add asset"
        />
      </SheetContent>
    </Sheet>
  );
}
