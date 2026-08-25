"use client";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { Zap } from "lucide-react";

import Sparkline from "../sparkline";
import WidgetCard from "../widget-card";

type Props = {
  latest: {
    id: string;
    utilityType: string;
    usage: number;
    unit: string;
    isAnomaly: boolean;
    averageUsage: number | null;
  } | null;
  trend: number[];
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
};

export default function UtilitiesWidget({
  latest,
  trend,
  dragHandleProps,
}: Props) {
  const deviationPct =
    latest?.averageUsage && latest.averageUsage > 0
      ? Math.round(
          ((latest.usage - latest.averageUsage) / latest.averageUsage) * 100
        )
      : null;

  return (
    <WidgetCard
      dragHandleProps={dragHandleProps}
      icon={Zap}
      title="Utilities"
      href="/utilities"
      linkLabel="View utilities"
      chip={
        latest
          ? latest.isAnomaly
            ? { label: "Unusual", tone: "bad" }
            : { label: "Normal", tone: "good" }
          : undefined
      }
    >
      {latest ? (
        <>
          <div className="text-2xl font-bold tabular-nums">
            {latest.usage.toLocaleString()}
            <span className="ml-1 text-sm font-medium text-muted-foreground">
              {latest.unit} this period
            </span>
          </div>
          <Sparkline
            values={trend}
            className="mt-2"
            stroke={
              latest.isAnomaly
                ? "hsl(var(--destructive))"
                : "hsl(var(--primary))"
            }
          />
          {deviationPct !== null && (
            <p className="mt-2 text-xs text-muted-foreground">
              {deviationPct >= 0 ? "+" : ""}
              {deviationPct}% vs your{" "}
              {Math.round(latest.averageUsage!).toLocaleString()} {latest.unit}{" "}
              average — {latest.utilityType}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No readings logged yet.</p>
      )}
    </WidgetCard>
  );
}
