"use client";

import { useEffect, useRef, useState } from "react";

import { format } from "date-fns";
import { Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

type Props = {
  value?: Date;
  onChange: (d: Date) => void;
  disabled?: boolean;
  className?: string;
};

export function TimePicker({ value, onChange, disabled, className }: Props) {
  const [open, setOpen] = useState(false);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const selectedHour = value?.getHours() ?? null;
  const rawMinute = value?.getMinutes() ?? null;
  const selectedMinute =
    rawMinute !== null ? Math.round(rawMinute / 5) * 5 : null;

  // Scroll selected item into view whenever the popover opens
  useEffect(() => {
    if (!open) return;
    const scrollTo = (ref: React.RefObject<HTMLDivElement>, index: number) => {
      const container = ref.current;
      if (!container) return;
      const item = container.children[index] as HTMLElement | undefined;
      if (item) {
        // Centre the selected item in the scroll container
        container.scrollTop =
          item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;
      }
    };
    setTimeout(() => {
      if (selectedHour !== null) scrollTo(hourRef, selectedHour);
      if (selectedMinute !== null) scrollTo(minuteRef, selectedMinute / 5);
    }, 0);
  }, [open, selectedHour, selectedMinute]);

  function setHour(h: number) {
    const next = value ? new Date(value) : new Date();
    next.setHours(h);
    if (!value) next.setMinutes(0, 0, 0);
    onChange(next);
  }

  function setMinute(m: number) {
    const next = value ? new Date(value) : new Date();
    next.setMinutes(m, 0, 0);
    onChange(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-28 justify-start font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 size-4 shrink-0" />
          {value ? format(value, "HH:mm") : "Time"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex gap-3">
          {/* Hours */}
          <Column label="Hour">
            <div
              ref={hourRef}
              className="h-44 overflow-y-auto pr-1 scrollbar-thin"
            >
              {HOURS.map((h) => (
                <TimeItem
                  key={h}
                  label={String(h).padStart(2, "0")}
                  selected={selectedHour === h}
                  onClick={() => setHour(h)}
                />
              ))}
            </div>
          </Column>

          <div className="flex items-center pb-1 text-muted-foreground">
            :
          </div>

          {/* Minutes */}
          <Column label="Min">
            <div
              ref={minuteRef}
              className="h-44 overflow-y-auto pr-1 scrollbar-thin"
            >
              {MINUTES.map((m) => (
                <TimeItem
                  key={m}
                  label={String(m).padStart(2, "0")}
                  selected={selectedMinute === m}
                  onClick={() => setMinute(m)}
                />
              ))}
            </div>
          </Column>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Column({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-center text-xs font-medium text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function TimeItem({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mb-0.5 flex h-8 w-12 items-center justify-center rounded-md text-sm transition-colors",
        selected
          ? "bg-primary text-primary-foreground font-medium"
          : "hover:bg-muted text-foreground"
      )}
    >
      {label}
    </button>
  );
}
