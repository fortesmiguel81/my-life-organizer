import { Suspense } from "react";

import Spinner from "@/components/spinner";

import HabitsView from "./_components/habits-view";

export default function HabitsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Habits</h1>
        <p className="text-sm text-muted-foreground">
          Build consistency with daily and weekly habits.
        </p>
      </div>
      <Suspense fallback={<Spinner size="icon" />}>
        <HabitsView />
      </Suspense>
    </div>
  );
}
