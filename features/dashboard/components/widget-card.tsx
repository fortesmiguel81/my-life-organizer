"use client";

import Link from "next/link";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { ChevronRight, GripVertical, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChipTone = "good" | "warn" | "bad" | "flat";

const CHIP_CLASSNAME: Record<ChipTone, string> = {
  good: "",
  warn: "bg-amber-500 text-white hover:bg-amber-500",
  bad: "",
  flat: "",
};

const CHIP_VARIANT: Record<
  ChipTone,
  "success" | "destructive" | "secondary" | "default"
> = {
  good: "success",
  warn: "default",
  bad: "destructive",
  flat: "secondary",
};

type Props = {
  icon: LucideIcon;
  title: string;
  chip?: { label: string; tone: ChipTone };
  href: string;
  linkLabel: string;
  className?: string;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  children: React.ReactNode;
};

export default function WidgetCard({
  icon: Icon,
  title,
  chip,
  href,
  linkLabel,
  className,
  dragHandleProps,
  children,
}: Props) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0 p-4 pb-0">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {dragHandleProps && (
            <span
              {...dragHandleProps}
              className="-ml-0.5 flex shrink-0 cursor-grab items-center text-muted-foreground/40 opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100"
              aria-label="Drag to reorder"
            >
              <GripVertical className="size-3.5" />
            </span>
          )}
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate">{title}</span>
        </span>
        {chip && (
          <Badge
            variant={CHIP_VARIANT[chip.tone]}
            className={cn("shrink-0 text-[10px]", CHIP_CLASSNAME[chip.tone])}
          >
            {chip.label}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-3">
        <div className="flex-1">{children}</div>
        <Button
          variant="link"
          size="sm"
          asChild
          className="h-auto justify-start gap-1 p-0 text-xs"
        >
          <Link href={href}>
            {linkLabel}
            <ChevronRight className="size-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
