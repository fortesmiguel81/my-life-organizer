import { Suspense } from "react";

import Spinner from "@/components/spinner";

import VendorsView from "./_components/vendors-view";

export default function VendorsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Vendors</h1>
        <p className="text-sm text-muted-foreground">
          Plumbers, electricians, and contractors — with quotes and service
          history.
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <VendorsView />
      </Suspense>
    </div>
  );
}
