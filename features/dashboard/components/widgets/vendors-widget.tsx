"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { HardHat } from "lucide-react";

import WidgetCard from "../widget-card";

type Props = {
  total: number;
  pendingCount: number;
  pendingQuote: { id: string; description: string; vendorName: string } | null;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function VendorsWidget({
  total,
  pendingCount,
  pendingQuote,
  dragHandleProps,
}: Props) {
  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={HardHat}
      title="Vendors"
      href="/vendors"
      linkLabel="View vendors"
      chip={
        pendingCount > 0
          ? { label: `${pendingCount} pending`, tone: "flat" }
          : { label: "Up to date", tone: "good" }
      }
    >
      <div className="text-2xl font-bold tabular-nums">
        {total}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          on file
        </span>
      </div>
      {pendingQuote ? (
        <p className="mt-2 text-xs text-muted-foreground">
          &quot;{pendingQuote.description}&quot; from {pendingQuote.vendorName}{" "}
          is awaiting review
        </p>
      ) : (
        total === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            No vendors yet. Add a plumber, electrician, or contractor.
          </p>
        )
      )}
    </WidgetCard>
  );
}
