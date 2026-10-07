import type { LucideIcon } from "lucide-react";
import { Building2, UserCheck, Users, UserX } from "lucide-react";
import type { CSSProperties } from "react";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@WorkSphere/ui/components/card";
import { Progress } from "@WorkSphere/ui/components/progress";

import { CountUp } from "@/components/count-up";
import { getEmployeeRoster } from "@/lib/employees";
import { formatDate, initials, joinTimestamp } from "@/lib/format";
import { serverFetch } from "@/lib/api";

import { HiringTrendChart, type HiringTrendPoint } from "./hiring-trend-chart";
import { StatusDonutChart } from "./status-donut-chart";

const CHART_PALETTE = [
  { badge: "bg-chart-1/12", text: "text-chart-1", indicator: "bg-chart-1" },
  { badge: "bg-chart-2/12", text: "text-chart-2", indicator: "bg-chart-2" },
  { badge: "bg-chart-3/12", text: "text-chart-3", indicator: "bg-chart-3" },
  { badge: "bg-chart-4/12", text: "text-chart-4", indicator: "bg-chart-4" },
  { badge: "bg-chart-5/12", text: "text-chart-5", indicator: "bg-chart-5" },
] as const;

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCounts: { department: string; count: number }[];
}

async function getStats(): Promise<DashboardStats | null> {
  const res = await serverFetch("/api/dashboard/stats");
  if (!res.ok) return null;
  const body = (await res.json()) as { data: DashboardStats };
  return body.data;
}

function hiringTrendFromRoster(
  roster: { joiningDate: string }[],
): HiringTrendPoint[] {
  const counts = new Map<string, number>();

  for (const employee of roster) {
    const timestamp = joinTimestamp(employee.joiningDate);
    if (timestamp === -Infinity) continue;

    const year = String(new Date(employee.joiningDate).getFullYear());
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }));
}

function StatCard({
  icon: Icon,
  value,
  label,
  colorIndex,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  colorIndex: number;
}) {
  const palette = CHART_PALETTE[colorIndex % CHART_PALETTE.length];

  return (
    <Card
      variant="interactive"
      className="animate-in-up"
      style={{ "--i": colorIndex } as CSSProperties}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted-foreground">{label}</span>
          <div className={`flex size-8 items-center justify-center rounded-md ${palette.badge}`}>
            <Icon className={`size-4 ${palette.text}`} />
          </div>
        </div>
        <CountUp value={value} className="text-3xl font-semibold tracking-tight" />
      </CardContent>
    </Card>
  );
}

export async function AdminDashboard() {
  const [stats, roster] = await Promise.all([getStats(), getEmployeeRoster()]);

  const recentlyJoined = [...roster]
    .sort((a, b) => joinTimestamp(b.joiningDate) - joinTimestamp(a.joiningDate))
    .slice(0, 6);

  const hiringTrend = hiringTrendFromRoster(roster);

  return (
    <div className="flex flex-col gap-6 p-6">
      {stats ? (
        <>
          <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-4">
            <StatCard
              icon={Users}
              value={stats.totalEmployees}
              label="Total Employees"
              colorIndex={0}
            />
            <StatCard
              icon={UserCheck}
              value={stats.activeEmployees}
              label="Active Employees"
              colorIndex={1}
            />
            <StatCard
              icon={UserX}
              value={stats.inactiveEmployees}
              label="Inactive Employees"
              colorIndex={2}
            />
            <StatCard
              icon={Building2}
              value={stats.departmentCounts.filter((d) => d.count > 0).length}
              label="Department Count"
              colorIndex={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Headcount by Department</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {stats.departmentCounts.map((d, i) => (
                  <div key={d.department} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span>{d.department}</span>
                      <span className="font-medium tabular-nums">{d.count}</span>
                    </div>
                    <Progress
                      value={
                        stats.totalEmployees > 0
                          ? (d.count / stats.totalEmployees) * 100
                          : 0
                      }
                      indicatorClassName={CHART_PALETTE[i % CHART_PALETTE.length].indicator}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employee Status</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusDonutChart
                  active={stats.activeEmployees}
                  inactive={stats.inactiveEmployees}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-6 text-xs text-muted-foreground">
            Could not load dashboard stats. Try again shortly.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Hiring Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <HiringTrendChart data={hiringTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Hires</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentlyJoined.length === 0 ? (
              <p className="text-xs text-muted-foreground">No employees yet.</p>
            ) : (
              recentlyJoined.map((employee) => (
                <div key={employee._id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback colorKey={employee.name}>{initials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">
                      {employee.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {employee.designation}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(employee.joiningDate)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
