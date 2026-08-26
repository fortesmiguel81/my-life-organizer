"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Package } from "lucide-react";

import WidgetCard from "../widget-card";

type Props = {
  nearest: {
    id: string;
    name: string;
    warrantyExpiration: string | Date;
    daysLeft: number;
  } | null;
  totalCount: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function AssetsWidget({
  nearest,
  totalCount,
  dragHandleProps,
}: Props) {
  const soon = nearest !== null && nearest.daysLeft <= 30;

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={Package}
      title="Assets"
      href="/assets"
      linkLabel="View assets"
      chip={
        nearest
          ? {
              label: soon ? "1 expiring" : "Covered",
              tone: soon ? "warn" : "good",
            }
          : { label: `${totalCount} on file`, tone: "flat" }
      }
    >
      {nearest ? (
        <>
          <div className="text-2xl font-bold tabular-nums">
            {nearest.daysLeft}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              days left
            </span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {nearest.name} warranty expires{" "}
            {new Date(nearest.warrantyExpiration).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {totalCount > 1 && ` — ${totalCount - 1} other assets covered`}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${totalCount} asset${totalCount === 1 ? "" : "s"} on file, no warranties expiring.`
            : "No assets tracked yet."}
        </p>
      )}
    </WidgetCard>
  );
}
