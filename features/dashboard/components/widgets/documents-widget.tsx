"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { FileText } from "lucide-react";

import WidgetCard from "../widget-card";

type Props = {
  nearest: {
    id: string;
    name: string;
    expiryDate: string | Date;
    daysLeft: number;
  } | null;
  totalCount: number;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function DocumentsWidget({
  nearest,
  totalCount,
  dragHandleProps,
}: Props) {
  const soon = nearest !== null && nearest.daysLeft <= 30;

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={FileText}
      title="Documents"
      href="/documents"
      linkLabel="View documents"
      chip={
        nearest
          ? {
              label: soon ? "1 expiring" : "Current",
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
            {nearest.name} expires{" "}
            {new Date(nearest.expiryDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {totalCount > 1 && ` — ${totalCount - 1} documents current`}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `${totalCount} document${totalCount === 1 ? "" : "s"} on file, nothing expiring.`
            : "No documents yet."}
        </p>
      )}
    </WidgetCard>
  );
}
