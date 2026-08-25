"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDeleteAsset } from "@/features/assets/api/use-delete-asset";
import { useEditAsset } from "@/features/assets/api/use-edit-asset";
import { useGetAssets } from "@/features/assets/api/use-get-assets";
import { useOpenAsset } from "@/features/assets/hooks/use-open-asset";
import { useConfirm } from "@/hooks/use-confirm";
import {
  convertAmountFromMiliunits,
  convertAmountToMiliunits,
} from "@/lib/utils";

import AssetForm, { AssetFormValues } from "./asset-form";

function amountToInputValue(miliunits: number | null | undefined) {
  if (miliunits === null || miliunits === undefined) return "";
  return Math.abs(convertAmountFromMiliunits(miliunits)).toString();
}

export default function EditAssetSheet() {
  const { id, isOpen, onClose } = useOpenAsset();
  const assetsQuery = useGetAssets();
  const editMutation = useEditAsset(id!);
  const deleteMutation = useDeleteAsset(id!);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete asset",
    "This will permanently delete this asset."
  );

  const asset = assetsQuery.data?.find((a) => a.id === id);

  const onSubmit = (values: AssetFormValues) => {
    editMutation.mutate(
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
            <SheetTitle>Edit asset</SheetTitle>
            <SheetDescription>
              Update this asset&apos;s details.
            </SheetDescription>
          </SheetHeader>
          {asset && (
            <AssetForm
              defaultValues={{
                name: asset.name,
                category: asset.category,
                brand: asset.brand,
                model: asset.model,
                serialNumber: asset.serialNumber,
                location: asset.location,
                purchaseDate: asset.purchaseDate
                  ? new Date(asset.purchaseDate)
                  : null,
                purchasePrice: amountToInputValue(asset.purchasePrice),
                insuranceValue: amountToInputValue(asset.insuranceValue),
                warrantyExpiration: asset.warrantyExpiration
                  ? new Date(asset.warrantyExpiration)
                  : null,
                manualDocumentId: asset.manualDocumentId,
                notes: asset.notes,
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
            Delete asset
          </button>
        </SheetContent>
      </Sheet>
    </>
  );
}
