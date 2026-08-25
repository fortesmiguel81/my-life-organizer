import { Suspense } from "react";

import Spinner from "@/components/spinner";

import UtilitiesView from "./_components/utilities-view";

export default function UtilitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Utilities</h1>
        <p className="text-sm text-muted-foreground">
          Electricity, water, and gas usage trends, with unusual-usage flags.
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <UtilitiesView />
      </Suspense>
    </div>
  );
}
