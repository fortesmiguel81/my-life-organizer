import { format } from "date-fns";

type ICSEvent = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  allDay?: boolean | null;
};

function escape(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function icsDate(d: Date | string) {
  return format(new Date(d), "yyyyMMdd");
}

function icsDateTime(d: Date | string) {
  return format(new Date(d), "yyyyMMdd'T'HHmmss'Z'");
}

export function buildICS(events: ICSEvent[]): string {
  const stamp = icsDateTime(new Date());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//My Life Organizer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const e of events) {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@my-life-organizer`);
    lines.push(`DTSTAMP:${stamp}`);

    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${icsDate(e.startDate)}`);
      lines.push(`DTEND;VALUE=DATE:${icsDate(e.endDate)}`);
    } else {
      lines.push(`DTSTART:${icsDateTime(e.startDate)}`);
      lines.push(`DTEND:${icsDateTime(e.endDate)}`);
    }

    lines.push(`SUMMARY:${escape(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${escape(e.description)}`);
    if (e.location) lines.push(`LOCATION:${escape(e.location)}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadICS(events: ICSEvent[], filename = "event.ics") {
  const blob = new Blob([buildICS(events)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
