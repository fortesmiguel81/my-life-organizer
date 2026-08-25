"use client";

import { useState } from "react";

import { Pencil, Phone, Plus, Star, Trash2 } from "lucide-react";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useGetMaintenanceTasks } from "@/features/maintenance/api/use-get-maintenance-tasks";
import { useOpenMaintenanceTask } from "@/features/maintenance/hooks/use-open-maintenance-task";
import { useCreateVendorQuote } from "@/features/vendors/api/use-create-vendor-quote";
import { useDeleteVendor } from "@/features/vendors/api/use-delete-vendor";
import { useDeleteVendorQuote } from "@/features/vendors/api/use-delete-vendor-quote";
import { useEditVendor } from "@/features/vendors/api/use-edit-vendor";
import { useEditVendorQuote } from "@/features/vendors/api/use-edit-vendor-quote";
import { useGetVendor } from "@/features/vendors/api/use-get-vendor";
import { useOpenVendor } from "@/features/vendors/hooks/use-open-vendor";
import { useConfirm } from "@/hooks/use-confirm";
import {
  convertAmountFromMiliunits,
  convertAmountToMiliunits,
  formatCurrency,
} from "@/lib/utils";

import QuoteForm, { QuoteFormValues, amountToInputValue } from "./quote-form";
import VendorForm, { TRADE_OPTIONS, VendorFormValues } from "./vendor-form";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  declined: "destructive",
  expired: "outline",
};

function QuoteRow({
  quote,
  vendorId,
}: {
  quote: {
    id: string;
    description: string;
    amount: number | null;
    status: "pending" | "accepted" | "declined" | "expired";
    quoteDate: string | Date | null;
    notes: string | null;
  };
  vendorId: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const editMutation = useEditVendorQuote(quote.id, vendorId);
  const deleteMutation = useDeleteVendorQuote(quote.id, vendorId);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete quote",
    "This will permanently delete this quote."
  );

  const onSave = (values: QuoteFormValues) => {
    editMutation.mutate(
      {
        description: values.description,
        amount: values.amount
          ? convertAmountToMiliunits(parseFloat(values.amount))
          : null,
        status: values.status,
        quoteDate: values.quoteDate ?? null,
        notes: values.notes || null,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate();
  };

  if (isEditing) {
    return (
      <>
        <ConfirmDialog />
        <QuoteForm
          defaultValues={{
            description: quote.description,
            amount: amountToInputValue(quote.amount),
            status: quote.status,
            quoteDate: quote.quoteDate ? new Date(quote.quoteDate) : null,
            notes: quote.notes,
          }}
          onSubmit={onSave}
          onCancel={() => setIsEditing(false)}
          disabled={editMutation.isPending}
          submitLabel="Save changes"
        />
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{quote.description}</p>
            <Badge
              variant={STATUS_VARIANT[quote.status]}
              className="shrink-0 text-[10px]"
            >
              {quote.status}
            </Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            {quote.amount != null && (
              <span>
                {formatCurrency(convertAmountFromMiliunits(quote.amount))}
              </span>
            )}
            {quote.quoteDate && (
              <span>{new Date(quote.quoteDate).toLocaleDateString()}</span>
            )}
          </div>
          {quote.notes && (
            <p className="mt-1 text-xs text-muted-foreground">{quote.notes}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={deleteMutation.isPending}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function EditVendorSheet() {
  const { id, isOpen, onClose } = useOpenVendor();
  const [isEditingVendor, setIsEditingVendor] = useState(false);
  const [isAddingQuote, setIsAddingQuote] = useState(false);

  const vendorQuery = useGetVendor(id);
  const maintenanceTasksQuery = useGetMaintenanceTasks();
  const { onOpen: openMaintenanceTask } = useOpenMaintenanceTask();
  const editMutation = useEditVendor(id!);
  const deleteMutation = useDeleteVendor(id!);
  const createQuoteMutation = useCreateVendorQuote(id!);
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete vendor",
    "This will permanently delete this vendor and all its quotes."
  );

  const vendor = vendorQuery.data;

  const handleClose = () => {
    setIsEditingVendor(false);
    setIsAddingQuote(false);
    onClose();
  };

  const onSaveVendor = (values: VendorFormValues) => {
    editMutation.mutate(
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
      { onSuccess: () => setIsEditingVendor(false) }
    );
  };

  const onDeleteVendor = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: handleClose });
  };

  const onAddQuote = (values: QuoteFormValues) => {
    createQuoteMutation.mutate(
      {
        vendorId: id!,
        description: values.description,
        amount: values.amount
          ? convertAmountToMiliunits(parseFloat(values.amount))
          : null,
        status: values.status,
        quoteDate: values.quoteDate ?? null,
        notes: values.notes || null,
      },
      { onSuccess: () => setIsAddingQuote(false) }
    );
  };

  const tradeLabel = vendor
    ? TRADE_OPTIONS.find((t) => t.value === vendor.trade)?.label
    : undefined;

  const relatedTasks = (maintenanceTasksQuery.data ?? []).filter(
    (t) => t.vendorId === id
  );

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="space-y-4 overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{vendor?.name ?? "Vendor"}</SheetTitle>
            <SheetDescription>
              {isEditingVendor
                ? "Edit vendor details."
                : "Contact details and quote history."}
            </SheetDescription>
          </SheetHeader>

          {vendorQuery.isLoading && (
            <div className="flex justify-center py-8">
              <Spinner size="icon" />
            </div>
          )}

          {vendor && isEditingVendor && (
            <VendorForm
              defaultValues={{
                name: vendor.name,
                trade: vendor.trade,
                phone: vendor.phone,
                email: vendor.email,
                website: vendor.website,
                address: vendor.address,
                rating: vendor.rating,
                notes: vendor.notes,
              }}
              onSubmit={onSaveVendor}
              disabled={editMutation.isPending}
              submitLabel="Save changes"
            />
          )}

          {vendor && !isEditingVendor && (
            <>
              <div className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{tradeLabel}</Badge>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setIsEditingVendor(true)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={onDeleteVendor}
                      disabled={deleteMutation.isPending}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                {vendor.rating != null && (
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className="size-3.5"
                        fill={n <= vendor.rating! ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                )}
                {vendor.phone && (
                  <p className="flex items-center gap-1.5 text-sm">
                    <Phone className="size-3.5 text-muted-foreground" />
                    {vendor.phone}
                  </p>
                )}
                {vendor.email && <p className="text-sm">{vendor.email}</p>}
                {vendor.website && (
                  <a
                    href={vendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm text-primary hover:underline"
                  >
                    {vendor.website}
                  </a>
                )}
                {vendor.address && (
                  <p className="text-sm text-muted-foreground">
                    {vendor.address}
                  </p>
                )}
                {vendor.notes && (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {vendor.notes}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    Quotes & service history
                  </h3>
                  {!isAddingQuote && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingQuote(true)}
                    >
                      <Plus className="mr-1 size-3.5" />
                      Add quote
                    </Button>
                  )}
                </div>

                {isAddingQuote && (
                  <QuoteForm
                    onSubmit={onAddQuote}
                    onCancel={() => setIsAddingQuote(false)}
                    disabled={createQuoteMutation.isPending}
                    submitLabel="Add quote"
                  />
                )}

                {vendor.quotes.length === 0 && !isAddingQuote ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No quotes yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {vendor.quotes.map((q) => (
                      <QuoteRow key={q.id} quote={q} vendorId={id!} />
                    ))}
                  </div>
                )}
              </div>

              {relatedTasks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Related maintenance tasks
                  </h3>
                  <div className="flex flex-col gap-2">
                    {relatedTasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openMaintenanceTask(t.id)}
                        className="flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <span className="truncate font-medium">{t.title}</span>
                        {t.dueDate && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            Due {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
