"use client";

import { useState } from "react";

import { AlertTriangle, FileText, Plus, X } from "lucide-react";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetDocuments } from "@/features/documents/api/use-get-documents";
import { useOpenDocument } from "@/features/documents/hooks/use-open-document";
import { useUploadDocument } from "@/features/documents/hooks/use-upload-document";
import { CATEGORY_LABELS } from "@/features/documents/components/document-metadata-form";

type Category = "all" | "legal" | "insurance" | "medical" | "household" | "financial" | "other";

const CATEGORY_ICONS: Record<string, string> = {
  legal: "⚖️",
  insurance: "🛡️",
  medical: "🏥",
  household: "🏠",
  financial: "💰",
  other: "📄",
};

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📕";
  if (mimeType.includes("word")) return "📝";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
  return "📄";
}

function ExpiryChip({ date }: { date: Date }) {
  const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return <Badge variant="destructive" className="text-[10px]">Expired</Badge>;
  if (diffDays <= 30) return <Badge variant="destructive" className="text-[10px]">~{diffDays}d left</Badge>;
  if (diffDays <= 90) return <Badge className="bg-amber-100 text-amber-800 text-[10px] dark:bg-amber-900 dark:text-amber-200">~{diffDays}d left</Badge>;
  return null;
}

export default function DocumentsView() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [tagFilter, setTagFilter] = useState<string | undefined>();

  const { onOpen: openDoc } = useOpenDocument();
  const { onOpen: openUpload } = useUploadDocument();

  const docsQuery = useGetDocuments({
    category: activeCategory !== "all" ? activeCategory : undefined,
    tag: tagFilter,
  });

  const expiringQuery = useGetDocuments({ expiring: 30 });

  const docs = docsQuery.data ?? [];
  const expiring = expiringQuery.data ?? [];

  const allTags = Array.from(new Set(docs.flatMap((d) => d.tags)));

  return (
    <div className="flex flex-col gap-4">
      {/* Expiring banner */}
      {expiring.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 dark:border-amber-400/60 dark:bg-amber-400/10">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Documents expiring soon
            </p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              {expiring.map((d) => d.name).join(", ")} expire within 30 days.
            </p>
          </div>
        </div>
      )}

      {/* Category tabs + upload button */}
      <div className="flex items-center gap-3">
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as Category)} className="flex-1">
          <TabsList className="h-9 flex-wrap">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="gap-1 text-xs">
                <span>{CATEGORY_ICONS[cat]}</span>
                {CATEGORY_LABELS[cat]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button size="sm" onClick={openUpload} className="shrink-0">
          <Plus className="mr-1 size-4" />
          Upload
        </Button>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? undefined : tag)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                tagFilter === tag
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {tag}
            </button>
          ))}
          {tagFilter && (
            <button
              onClick={() => setTagFilter(undefined)}
              className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <X className="size-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Document grid */}
      {docsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="icon" />
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <FileText className="size-10 opacity-30" />
          <p className="text-sm">No documents yet.</p>
          <Button size="sm" variant="outline" onClick={openUpload}>
            <Plus className="mr-1 size-4" />
            Upload first document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {docs.map((doc) => {
            const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
            return (
              <button
                key={doc.id}
                onClick={() => openDoc(doc.id)}
                className="flex flex-col gap-2 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{getMimeIcon(doc.mimeType)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {CATEGORY_LABELS[doc.category]}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm font-medium">{doc.name}</p>
                {doc.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">{doc.description}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
                  {expiryDate && <ExpiryChip date={expiryDate} />}
                  {doc.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 2 && (
                    <span className="text-[10px] text-muted-foreground">+{doc.tags.length - 2}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
