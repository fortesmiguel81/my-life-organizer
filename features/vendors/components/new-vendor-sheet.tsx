"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateVendor } from "@/features/vendors/api/use-create-vendor";
import { useNewVendor } from "@/features/vendors/hooks/use-new-vendor";

import VendorForm, { VendorFormValues } from "./vendor-form";

export default function NewVendorSheet() {
  const { isOpen, onClose } = useNewVendor();
  const mutation = useCreateVendor();

  const onSubmit = (values: VendorFormValues) => {
    mutation.mutate(
      {
        name: values.name,
        trade: values.trade,
        phone: values.phone || null,
        email: values.email || null,
        website: values.website || null,
        address: values.address || null,
        rating: values.rating ?? null,
        notes: values.notes || null,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New vendor</SheetTitle>
          <SheetDescription>
            Add a contractor or service provider to your directory.
          </SheetDescription>
        </SheetHeader>
        <VendorForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          submitLabel="Add vendor"
        />
      </SheetContent>
    </Sheet>
  );
}
