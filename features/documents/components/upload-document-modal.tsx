"use client";

import { useCallback, useRef, useState } from "react";

import { FileText, Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateDocument } from "@/features/documents/api/use-create-document";
import { useUploadDocument } from "@/features/documents/hooks/use-upload-document";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

import DocumentMetadataForm, { DocumentMetadataFormValues } from "./document-metadata-form";

type UploadedFile = {
  url: string;
  key: string;
  name: string;
  size: number;
  type: string;
};

export default function UploadDocumentModal() {
  const { isOpen, onClose } = useUploadDocument();
  const createMutation = useCreateDocument();
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("documentUploader", {
    onClientUploadComplete: (files) => {
      const f = files[0];
      setUploaded({
        url: f.ufsUrl,
        key: f.key,
        name: f.name,
        size: f.size,
        type: f.type ?? "application/octet-stream",
      });
      setUploadProgress(0);
    },
    onUploadProgress: (p) => setUploadProgress(p),
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      startUpload(Array.from(files));
    },
    [startUpload]
  );

  const handleClose = () => {
    if (isUploading) return;
    setUploaded(null);
    setUploadProgress(0);
    onClose();
  };

  const onSubmitMetadata = (values: DocumentMetadataFormValues) => {
    if (!uploaded) return;
    createMutation.mutate(
      {
        name: values.name,
        description: values.description ?? null,
        category: values.category,
        tags: values.tags,
        expiryDate: values.expiryDate ?? null,
        fileUrl: uploaded.url,
        fileKey: uploaded.key,
        mimeType: uploaded.type,
        fileSize: uploaded.size,
      },
      { onSuccess: handleClose }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{uploaded ? "Document details" : "Upload document"}</DialogTitle>
          <DialogDescription>
            {uploaded
              ? "Add a name, category, and optional expiry date."
              : "Select or drag a file to upload. Max 16 MB."}
          </DialogDescription>
        </DialogHeader>

        {!uploaded ? (
          <div className="space-y-3">
            {/* Dropzone */}
            <div
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors",
                isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                isUploading && "pointer-events-none opacity-60"
              )}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Uploading… {uploadProgress}%</p>
                  <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <Upload className="size-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Drop file here or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PDF, Word, Excel, or image — up to 16 MB
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline">
                    Choose file
                  </Button>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/webp"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <FileText className="size-8 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{uploaded.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploaded.size / 1024 / 1024).toFixed(2)} MB · {uploaded.type}
                </p>
              </div>
            </div>
            <DocumentMetadataForm
              defaultValues={{ name: uploaded.name.replace(/\.[^.]+$/, "") }}
              onSubmit={onSubmitMetadata}
              disabled={createMutation.isPending}
              submitLabel="Save document"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
