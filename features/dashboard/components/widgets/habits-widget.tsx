"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

import WidgetCard from "../widget-card";

type Props = {
  doneToday: number;
  dueToday: number;
  dueTodayHabits: { id: string; done: boolean }[];
  bestStreak: { title: string; count: number } | null;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function HabitsWidget({
  doneToday,
  dueToday,
  dueTodayHabits,
  bestStreak,
  dragHandleProps,
}: Props) {
  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={CheckCircle2}
      title="Habits"
      href="/habits"
      linkLabel="View habits"
      chip={
        dueToday === 0
          ? { label: "None due today", tone: "flat" }
          : {
              label: `${doneToday} of ${dueToday} done`,
              tone: doneToday > 0 ? "good" : "flat",
            }
      }
    >
      <div className="text-2xl font-bold tabular-nums">
        {doneToday}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          / {dueToday} today
        </span>
      </div>
      {dueTodayHabits.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {dueTodayHabits.map((h) => (
            <span
              key={h.id}
              className={cn(
                "size-2 rounded-full",
                h.done ? "bg-emerald-500" : "bg-muted-foreground/25"
              )}
            />
          ))}
        </div>
      )}
      {bestStreak && (
        <p className="mt-2 text-xs text-muted-foreground">
          🔥{" "}
          <span className="font-semibold text-foreground">
            {bestStreak.count}-day streak
          </span>{" "}
          — {bestStreak.title}
        </p>
      )}
    </WidgetCard>
  );
}
