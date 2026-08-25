"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { ListChecks } from "lucide-react";

import { relativeDayLabel } from "../../format";
import WidgetCard from "../widget-card";

type Props = {
  overdueCount: number;
  dueTodayCount: number;
  upcoming: {
    id: string;
    title: string;
    dueDate: string | Date;
    overdue: boolean;
  }[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function TasksWidget({
  overdueCount,
  dueTodayCount,
  upcoming,
  dragHandleProps,
}: Props) {
  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={ListChecks}
      title="Tasks"
      href="/tasks"
      linkLabel="View tasks"
      chip={
        overdueCount > 0
          ? { label: `${overdueCount} overdue`, tone: "bad" }
          : dueTodayCount > 0
            ? { label: `${dueTodayCount} due today`, tone: "warn" }
            : { label: "All caught up", tone: "good" }
      }
    >
      <div className="text-2xl font-bold tabular-nums">
        {dueTodayCount}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          due today
        </span>
      </div>
      {upcoming.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {upcoming.map((t) => (
            <div
              key={t.id}
              className="flex items-baseline justify-between gap-2 text-xs"
            >
              <span className="truncate">{t.title}</span>
              <span
                className={
                  t.overdue
                    ? "shrink-0 font-semibold text-destructive"
                    : "shrink-0 text-muted-foreground"
                }
              >
                {relativeDayLabel(t.dueDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
