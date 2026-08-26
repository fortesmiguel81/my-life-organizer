"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Wrench } from "lucide-react";

import { relativeDayLabel } from "../../format";
import WidgetCard from "../widget-card";

type Props = {
  overdueCount: number;
  openCount: number;
  items: {
    id: string;
    title: string;
    dueDate: string | Date;
    overdue: boolean;
  }[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function MaintenanceWidget({
  overdueCount,
  openCount,
  items,
  dragHandleProps,
}: Props) {
  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={Wrench}
      title="Maintenance"
      href="/maintenance"
      linkLabel="View maintenance"
      chip={
        overdueCount > 0
          ? { label: `${overdueCount} overdue`, tone: "bad" }
          : openCount > 0
            ? { label: `${openCount} open`, tone: "flat" }
            : { label: "All caught up", tone: "good" }
      }
    >
      <div className="text-2xl font-bold tabular-nums">
        {openCount}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          open tasks
        </span>
      </div>
      {items.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {items.map((t) => (
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
