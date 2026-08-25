"use client";

import { useMemo, useState } from "react";

import { AlertTriangle, Plus } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import Spinner from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetUtilityReadings } from "@/features/utilities/api/use-get-utility-readings";
import { UTILITY_TYPE_OPTIONS } from "@/features/utilities/components/utility-reading-form";
import { useNewUtilityReading } from "@/features/utilities/hooks/use-new-utility-reading";
import { useOpenUtilityReading } from "@/features/utilities/hooks/use-open-utility-reading";
import { convertAmountFromMiliunits, formatCurrency } from "@/lib/utils";

type Reading = {
  id: string;
  utilityType: "electricity" | "water" | "gas" | "other";
  periodStart: string | Date;
  periodEnd: string | Date;
  usage: number;
  unit: string;
  cost: number | null;
  notes: string | null;
  isAnomaly: boolean;
  averageUsage: number | null;
};

const TYPE_COLOR: Record<string, string> = {
  electricity: "hsl(var(--chart-1))",
  water: "hsl(var(--chart-2))",
  gas: "hsl(var(--chart-3))",
  other: "hsl(var(--chart-4))",
};

const chartConfig = {
  usage: { label: "Usage" },
} satisfies ChartConfig;

function ReadingCard({ reading }: { reading: Reading }) {
  const { onOpen } = useOpenUtilityReading();
  const typeLabel = UTILITY_TYPE_OPTIONS.find(
    (t) => t.value === reading.utilityType
  )?.label;

  return (
    <button
      onClick={() => onOpen(reading.id)}
      className="flex flex-col items-start gap-2 rounded-xl border bg-background p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <p className="font-semibold">
          {new Date(reading.periodStart).toLocaleDateString()} –{" "}
          {new Date(reading.periodEnd).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary" className="text-[10px]">
          {typeLabel}
        </Badge>
        {reading.isAnomaly && (
          <Badge variant="destructive" className="gap-1 text-[10px]">
            <AlertTriangle className="size-3" />
            Unusual usage
          </Badge>
        )}
      </div>
      <p className="text-sm">
        {reading.usage.toLocaleString()} {reading.unit}
        {reading.averageUsage != null && (
          <span className="text-muted-foreground">
            {" "}
            (avg {reading.averageUsage.toFixed(1)} {reading.unit})
          </span>
        )}
      </p>
      {reading.cost != null && (
        <p className="text-xs text-muted-foreground">
          {formatCurrency(convertAmountFromMiliunits(reading.cost))}
        </p>
      )}
    </button>
  );
}

export default function UtilitiesView() {
  const { onOpen: openNew } = useNewUtilityReading();
  const { data: readings, isLoading } = useGetUtilityReadings();
  const [typeFilter, setTypeFilter] = useState<string>("electricity");

  const filtered = useMemo(() => {
    if (!readings) return [];
    return readings.filter((r) => r.utilityType === typeFilter);
  }, [readings, typeFilter]);

  const chartData = useMemo(
    () =>
      [...filtered]
        .sort(
          (a, b) =>
            new Date(a.periodStart).getTime() -
            new Date(b.periodStart).getTime()
        )
        .map((r) => ({
          period: new Date(r.periodStart).toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          usage: r.usage,
        })),
    [filtered]
  );

  const anomalyCount = filtered.filter((r) => r.isAnomaly).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UTILITY_TYPE_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openNew} className="ml-auto shrink-0">
          <Plus className="mr-1 size-4" />
          New reading
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="icon" />
        </div>
      ) : (
        <>
          {chartData.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Usage trend
                  {anomalyCount > 0 && (
                    <Badge variant="destructive" className="gap-1 text-[10px]">
                      <AlertTriangle className="size-3" />
                      {anomalyCount} unusual reading
                      {anomalyCount === 1 ? "" : "s"}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="period" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="usage"
                      stroke={TYPE_COLOR[typeFilter]}
                      strokeWidth={2}
                      dot
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {!filtered.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <span className="text-5xl">⚡</span>
              <p className="text-sm">
                {readings?.length
                  ? "No readings for this utility yet."
                  : "No utility readings yet. Log a bill to start tracking trends."}
              </p>
              <Button size="sm" variant="outline" onClick={openNew}>
                <Plus className="mr-1 size-4" />
                Add first reading
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.periodStart).getTime() -
                    new Date(a.periodStart).getTime()
                )
                .map((r) => (
                  <ReadingCard key={r.id} reading={r} />
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
