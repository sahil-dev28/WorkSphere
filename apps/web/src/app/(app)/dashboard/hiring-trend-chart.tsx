"use client";

import { Area, AreaChart, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@WorkSphere/ui/components/chart";

export interface HiringTrendPoint {
  year: string;
  count: number;
}

const chartConfig = {
  count: {
    label: "Hires",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export function HiringTrendChart({ data }: { data: HiringTrendPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-xs text-muted-foreground">
        Not enough data yet.
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-48 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="hiringTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-count)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="year"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-count)"
          strokeWidth={2}
          fill="url(#hiringTrendFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
