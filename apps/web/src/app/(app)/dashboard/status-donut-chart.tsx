"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@WorkSphere/ui/components/chart";

const chartConfig = {
  active: { label: "Active", color: "var(--chart-1)" },
  inactive: { label: "Inactive", color: "var(--muted)" },
} satisfies ChartConfig;

export function StatusDonutChart({ active, inactive }: { active: number; inactive: number }) {
  const total = active + inactive;
  const data = [
    { status: "active" as const, value: active },
    { status: "inactive" as const, value: inactive },
  ];

  return (
    <div className="flex items-center gap-6">
      <ChartContainer config={chartConfig} className="aspect-square h-36 w-36 shrink-0">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="status"
            innerRadius="65%"
            outerRadius="100%"
            paddingAngle={total > 0 ? 3 : 0}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={`var(--color-${entry.status})`} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex flex-col gap-2.5">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: chartConfig[entry.status].color }}
            />
            <span className="font-medium text-foreground">{chartConfig[entry.status].label}</span>
            <span className="text-muted-foreground">
              {entry.value} ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
