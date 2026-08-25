import { Suspense } from "react";

import Spinner from "@/components/spinner";

import ShoppingView from "./_components/shopping-view";

export default function ShoppingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Shopping</h1>
        <p className="text-sm text-muted-foreground">
          Manage your grocery and shopping lists
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <ShoppingView />
      </Suspense>
    </div>
  );
}
