"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// Per theme.md: donut active segment = chart-1, inactive = muted — reusing
// existing tokens rather than inventing new colors. Counts + percentages are
// always shown as text so identity never rides on color alone.
const ACTIVE_COLOR = "var(--chart-1)";
const INACTIVE_COLOR = "var(--muted)";

export function StatusDonutChart({ active, inactive }: { active: number; inactive: number }) {
  const total = active + inactive;
  const data = [
    { name: "Active", value: active, color: ACTIVE_COLOR },
    { name: "Inactive", value: inactive, color: INACTIVE_COLOR },
  ];

  return (
    <div className="flex items-center gap-6">
      <div className="h-36 w-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="100%"
              paddingAngle={total > 0 ? 3 : 0}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium text-foreground">{entry.name}</span>
            <span className="text-muted-foreground">
              {entry.value} ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
