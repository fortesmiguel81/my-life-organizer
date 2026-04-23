"use client";

import { useEffect } from "react";

import { IlamyCalendar } from "@ilamy/calendar";
import type { CalendarEvent, CellClickInfo } from "@ilamy/calendar";
import { Cloud, Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useGoogleCalendarStatus,
  useImportGoogleEvents,
} from "@/features/events/api/use-import-google-events";
import { useGetEvents } from "@/features/events/api/use-get-events";
import { useNewEvent } from "@/features/events/hooks/use-new-event";
import { useOpenEvent } from "@/features/events/hooks/use-open-event";

export default function CalendarView() {
  const searchParams = useSearchParams();
  const { onOpen: openNew } = useNewEvent();
  const { onOpen: openEdit } = useOpenEvent();

  const eventsQuery = useGetEvents();
  const { data: isConnected } = useGoogleCalendarStatus();
  const importMutation = useImportGoogleEvents();

  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      toast.success("Google Calendar connected!");
    }
    if (searchParams.get("error")) {
      toast.error("Failed to connect Google Calendar.");
    }
  }, [searchParams]);

  const calendarEvents = (eventsQuery.data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    start: new Date(e.startDate),
    end: new Date(e.endDate),
    allDay: e.allDay,
    color: e.color ?? undefined,
    description: e.description ?? undefined,
    location: e.location ?? undefined,
  }));

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Sync Google Calendar
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <a href="/api/google-calendar/auth">
              <Cloud className="mr-2 size-4" />
              Connect Google Calendar
            </a>
          </Button>
        )}
        <Button size="sm" onClick={() => openNew()}>
          + New Event
        </Button>
      </div>

      {/* Calendar */}
      <div className="h-[calc(100vh-14rem)]">
        {eventsQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <IlamyCalendar
            events={calendarEvents}
            initialView="month"
            firstDayOfWeek="monday"
            timeFormat="24-hour"
            onEventClick={(event: CalendarEvent) => openEdit(event.id as string)}
            onCellClick={(info: CellClickInfo) =>
              openNew(info.start.toDate(), info.end.toDate())
            }
            renderEventForm={() => null}
          />
        )}
      </div>
    </div>
  );
}
