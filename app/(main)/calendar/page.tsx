import { Suspense } from "react";

import CalendarView from "./_components/calendar-view";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Schedule and manage your life events
        </p>
      </div>
      <Suspense>
        <CalendarView />
      </Suspense>
    </div>
  );
}
