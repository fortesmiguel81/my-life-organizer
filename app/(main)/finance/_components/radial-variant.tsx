import { LabelList, RadialBar, RadialBarChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

const COLORS = ["#0062FF", "#12C6FF", "#FF647F", "##FF9354"];

type Props = {
  data?: {
    name: string;
    value: number;
  }[];
};

export function RadialVariant({ data = [] }: Props) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <RadialBarChart
        data={chartData}
        startAngle={-90}
        endAngle={380}
        innerRadius={30}
        outerRadius={110}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="name" />}
        />
        <RadialBar dataKey="value" background>
          <LabelList
            position="insideStart"
            dataKey="name"
            className="fill-white capitalize mix-blend-luminosity"
            fontSize={11}
          />
        </RadialBar>
      </RadialBarChart>
    </ChartContainer>
  );
}
