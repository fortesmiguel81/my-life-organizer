"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { ShoppingCart } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

import WidgetCard from "../widget-card";

type Props = {
  itemsLeft: number;
  listCount: number;
  estimatedTotal: number;
  lists: { name: string; count: number }[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function ShoppingWidget({
  itemsLeft,
  listCount,
  estimatedTotal,
  lists,
  dragHandleProps,
}: Props) {
  const summary = lists.map((l) => `${l.name} (${l.count})`).join(" · ");

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={ShoppingCart}
      title="Shopping"
      href="/shopping"
      linkLabel="View shopping"
      chip={
        listCount > 0
          ? {
              label: `${listCount} list${listCount === 1 ? "" : "s"}`,
              tone: "flat",
            }
          : undefined
      }
    >
      <div className="text-2xl font-bold tabular-nums">
        {itemsLeft}
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          items left
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {summary || "No lists yet."}
        {estimatedTotal > 0 &&
          ` — ~${formatCurrency(estimatedTotal / 100)} estimated`}
      </p>
    </WidgetCard>
  );
}
