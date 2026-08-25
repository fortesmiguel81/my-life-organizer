import { Suspense } from "react";

import Spinner from "@/components/spinner";

import MaintenanceView from "./_components/maintenance-view";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <p className="text-sm text-muted-foreground">
          Recurring and one-off maintenance tasks, with due-date alerts.
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <MaintenanceView />
      </Suspense>
    </div>
  );
}
