"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Calendar } from "lucide-react";

import { relativeDayLabel } from "../../format";
import WidgetCard from "../widget-card";

type Props = {
  upcoming: {
    id: string;
    title: string;
    startDate: string | Date;
    allDay: boolean;
  }[];
  upcomingCount: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function CalendarWidget({
  upcoming,
  upcomingCount,
  dragHandleProps,
}: Props) {
  const next = upcoming[0];
  const nextTime =
    next && !next.allDay
      ? new Date(next.startDate).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : null;

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={Calendar}
      title="Calendar"
      href="/calendar"
      linkLabel="View calendar"
      chip={
        upcomingCount > 0
          ? { label: `${upcomingCount} upcoming`, tone: "flat" }
          : { label: "Nothing soon", tone: "flat" }
      }
    >
      {next ? (
        <div className="text-2xl font-bold tabular-nums">
          {nextTime ?? "All day"}
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            next
          </span>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No upcoming events.</p>
      )}
      {upcoming.length > 0 && (
        <div className="mt-2 flex flex-col gap-1.5">
          {upcoming.map((e) => (
            <div
              key={e.id}
              className="flex items-baseline justify-between gap-2 text-xs"
            >
              <span className="truncate">{e.title}</span>
              <span className="shrink-0 text-muted-foreground">
                {relativeDayLabel(e.startDate)}
              </span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}
