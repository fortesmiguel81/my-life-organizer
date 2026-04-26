import { Suspense } from "react";

import Spinner from "@/components/spinner";

import DocumentsView from "./_components/documents-view";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Document Vault</h1>
        <p className="text-sm text-muted-foreground">
          Store and manage important documents securely
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <DocumentsView />
      </Suspense>
    </div>
  );
}
