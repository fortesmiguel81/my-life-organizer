import { Suspense } from "react";

import Spinner from "@/components/spinner";

import AssetsView from "./_components/assets-view";

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Assets</h1>
        <p className="text-sm text-muted-foreground">
          Home devices, appliances, and valuables — with warranties, manuals,
          and insurance values.
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <AssetsView />
      </Suspense>
    </div>
  );
}
