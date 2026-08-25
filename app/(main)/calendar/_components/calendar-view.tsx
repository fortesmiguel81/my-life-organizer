"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-default/dist/index.css";
import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import "temporal-polyfill/global";

import { Button } from "@/components/ui/button";
import { useGetEvents } from "@/features/events/api/use-get-events";
import { useNewEvent } from "@/features/events/hooks/use-new-event";
import { useOpenEvent } from "@/features/events/hooks/use-open-event";

function toTemporalDate(
  date: Date | string,
  allDay: boolean
): Temporal.PlainDate | Temporal.ZonedDateTime {
  const d = typeof date === "string" ? new Date(date) : date;
  if (allDay) {
    return Temporal.PlainDate.from({
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    });
  }
  return Temporal.Instant.fromEpochMilliseconds(d.getTime()).toZonedDateTimeISO(
    "UTC"
  );
}

type SxEvent = {
  id: string;
  title: string;
  start: Temporal.PlainDate | Temporal.ZonedDateTime;
  end: Temporal.PlainDate | Temporal.ZonedDateTime;
};

type CalendarWidgetProps = {
  isDark: boolean;
  events: SxEvent[];
  onEventClick: (id: string) => void;
  onClickDate: (date: Temporal.PlainDate) => void;
  onClickDateTime: (dateTime: Temporal.ZonedDateTime) => void;
};

function CalendarWidget({
  isDark,
  events,
  onEventClick,
  onClickDate,
  onClickDateTime,
}: CalendarWidgetProps) {
  const eventsService = useMemo(() => createEventsServicePlugin(), []);

  const calendar = useCalendarApp(
    {
      views: [
        createViewDay(),
        createViewWeek(),
        createViewMonthGrid(),
        createViewMonthAgenda(),
      ],
      firstDayOfWeek: 1,
      isDark,
      weekOptions: { gridHeight: 1000 },
      dayBoundaries: { start: "06:00", end: "22:00" },
      callbacks: {
        onEventClick: (event) => onEventClick(String(event.id)),
        onClickDate,
        onClickDateTime,
      },
    },
    [eventsService]
  );

  useEffect(() => {
    eventsService.set(events);
  }, [events, eventsService]);

  return <ScheduleXCalendar calendarApp={calendar} />;
}

export default function CalendarView() {
  const searchParams = useSearchParams();
  const { onOpen: openNew } = useNewEvent();
  const { onOpen: openEdit } = useOpenEvent();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const eventsQuery = useGetEvents();

  useEffect(() => {
    if (searchParams.get("error")) {
      toast.error("Something went wrong.");
    }
  }, [searchParams]);

  const calendarEvents = useMemo<SxEvent[]>(
    () =>
      (eventsQuery.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        start: toTemporalDate(e.startDate, e.allDay ?? false),
        end: toTemporalDate(e.endDate, e.allDay ?? false),
      })),
    [eventsQuery.data]
  );

  function handleClickDate(date: Temporal.PlainDate) {
    const start = new Date(`${date.toString()}T09:00:00Z`);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    openNew({ start, end });
  }

  function handleClickDateTime(dateTime: Temporal.ZonedDateTime) {
    const start = new Date(dateTime.epochMilliseconds);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    openNew({ start, end });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" onClick={() => openNew({})}>
          + New Event
        </Button>
      </div>

      <div className="h-[calc(100vh-20rem)] overflow-hidden">
        {eventsQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CalendarWidget
            key={String(isDark)}
            isDark={isDark}
            events={calendarEvents}
            onEventClick={openEdit}
            onClickDate={handleClickDate}
            onClickDateTime={handleClickDateTime}
          />
        )}
      </div>
    </div>
  );
}
