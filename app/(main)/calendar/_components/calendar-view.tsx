"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { useEffect } from "react";

import { Calendar, dateFnsLocalizer, type Event, type SlotInfo } from "react-big-calendar";
import {
  format,
  getDay,
  parse,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
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

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales: { "en-US": enUS },
});

type CalendarEvent = Event & { id: string; googleEventId: string | null };

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

  const calendarEvents: CalendarEvent[] = (eventsQuery.data ?? []).map(
    (e) => ({
      id: e.id,
      title: e.title,
      start: new Date(e.startDate),
      end: new Date(e.endDate),
      allDay: e.allDay,
      googleEventId: e.googleEventId,
      resource: e,
    })
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
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
      </div>

      {/* Calendar */}
      <div className="rbc-wrapper h-[calc(100vh-14rem)] rounded-lg border bg-background p-2">
        {eventsQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            defaultView="month"
            views={["month", "week", "day", "agenda"]}
            selectable
            onSelectSlot={({ start, end }: SlotInfo) => openNew(start, end)}
            onSelectEvent={(event: CalendarEvent) => openEdit(event.id)}
            eventPropGetter={(event: CalendarEvent) => {
              const isGoogle = !!event.googleEventId;
              return {
                style: {
                  backgroundColor: isGoogle
                    ? "hsl(var(--primary) / 0.6)"
                    : "hsl(var(--primary))",
                  border: "none",
                  borderRadius: "4px",
                },
              };
            }}
            style={{ height: "100%" }}
          />
        )}
      </div>
    </div>
  );
}
