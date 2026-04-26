"use client";

import { useState } from "react";

import { Download, FileText, Pencil, Trash2 } from "lucide-react";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDeleteDocument } from "@/features/documents/api/use-delete-document";
import { useEditDocument } from "@/features/documents/api/use-edit-document";
import { useGetDocument } from "@/features/documents/api/use-get-document";
import { useOpenDocument } from "@/features/documents/hooks/use-open-document";
import { useConfirm } from "@/hooks/use-confirm";

import DocumentMetadataForm, { CATEGORY_LABELS, DocumentMetadataFormValues } from "./document-metadata-form";

function ExpiryChip({ date }: { date: Date | null }) {
  if (!date) return null;
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return <Badge variant="destructive">Expired</Badge>;
  if (diffDays <= 30) return <Badge variant="destructive">Expires in {diffDays}d</Badge>;
  if (diffDays <= 90) return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Expires in {diffDays}d</Badge>;
  return <Badge variant="secondary">{date.toLocaleDateString()}</Badge>;
}

export default function DocumentDetailSheet() {
  const { id, isOpen, onClose } = useOpenDocument();
  const docQuery = useGetDocument(id);
  const editMutation = useEditDocument(id);
  const deleteMutation = useDeleteDocument(id);
  const [editing, setEditing] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm("Delete document?", "The file will be permanently removed from storage.");

  const doc = docQuery.data;

  const onEdit = (values: DocumentMetadataFormValues) => {
    editMutation.mutate(
      {
        name: values.name,
        description: values.description ?? null,
        category: values.category,
        tags: values.tags,
        expiryDate: values.expiryDate ?? null,
      },
      { onSuccess: () => setEditing(false) }
    );
  };

  const onDelete = async () => {
    const ok = await confirm();
    if (ok) deleteMutation.mutate(undefined, { onSuccess: onClose });
  };

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  const isImage = doc?.mimeType.startsWith("image/");
  const isPdf = doc?.mimeType === "application/pdf";

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="flex flex-col gap-4 overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? "Edit document" : "Document details"}</SheetTitle>
            <SheetDescription>
              {editing ? "Update name, category, tags, or expiry date." : doc?.name ?? "Loading…"}
            </SheetDescription>
          </SheetHeader>

          {docQuery.isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner size="icon" />
            </div>
          ) : !doc ? null : editing ? (
            <DocumentMetadataForm
              defaultValues={{
                name: doc.name,
                description: doc.description ?? "",
                category: doc.category,
                tags: doc.tags,
                expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : null,
              }}
              onSubmit={onEdit}
              disabled={editMutation.isPending}
              submitLabel="Save changes"
            />
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              {isImage && (
                <img
                  src={doc.fileUrl}
                  alt={doc.name}
                  className="max-h-64 w-full rounded-lg border object-contain"
                />
              )}
              {isPdf && (
                <iframe
                  src={doc.fileUrl}
                  className="h-64 w-full rounded-lg border"
                  title={doc.name}
                />
              )}
              {!isImage && !isPdf && (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                  <FileText className="size-8 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.mimeType}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2 rounded-lg border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <Badge variant="secondary">{CATEGORY_LABELS[doc.category]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">File size</span>
                  <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expiry</span>
                  <ExpiryChip date={doc.expiryDate ? new Date(doc.expiryDate) : null} />
                </div>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {doc.description && (
                  <p className="pt-1 text-xs text-muted-foreground">{doc.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full gap-2">
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="size-4" />
                    Download
                  </a>
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" />
                  Edit details
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={onDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="size-4" />
                  Delete document
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
