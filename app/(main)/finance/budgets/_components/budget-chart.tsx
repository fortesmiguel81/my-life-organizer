"use client";

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { formatCurrency, getRandomHexColor } from "@/lib/utils";

const chartConfig = {
  percentage: {
    label: "Percentage",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  data: { amount: number; amountSpent: number; category: string };
};

export function BudgetChart({ data }: Props) {
  const chartData = [
    {
      ...data,
      amountSpentProgress: (data.amountSpent / data.amount) * 100,
      fill: getRandomHexColor(),
    },
  ];

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
      style={{ width: 200, height: 200 }} // Set chart container size
    >
      <RadialBarChart
        data={chartData}
        startAngle={90}
        endAngle={90 + 360 * (chartData[0].amountSpentProgress / 100)}
        innerRadius={80}
        outerRadius={110}
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-background"
          polarRadius={[86, 74]}
        />
        <RadialBar dataKey="amountSpentProgress" background cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {formatCurrency(chartData[0]?.amountSpent)}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
