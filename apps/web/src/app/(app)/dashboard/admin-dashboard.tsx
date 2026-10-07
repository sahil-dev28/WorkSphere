import { Building2, ChevronRight, UserCheck, Users, UserX } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@WorkSphere/ui/components/card";
import { Progress } from "@WorkSphere/ui/components/progress";

import { Greeting, TodayLabel } from "@/components/greeting";
import { PageHeader } from "@/components/page-header";
import { joinedWithin, monthlyHeadcount, percent } from "@/lib/dashboard-metrics";
import { getEmployeeRoster } from "@/lib/employees";
import { formatDate, initials, joinTimestamp } from "@/lib/format";
import { serverFetch } from "@/lib/api";
import type { Me } from "@/lib/session";

import { HiringTrendChart, type HiringTrendPoint } from "./hiring-trend-chart";
import { KpiCard } from "./kpi-card";
import { AdminQuickActions } from "./quick-actions";
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

export async function AdminDashboard({ user }: { user: Me }) {
  const [stats, roster] = await Promise.all([getStats(), getEmployeeRoster()]);
  const now = new Date();

  const recentlyJoined = [...roster]
    .sort((a, b) => joinTimestamp(b.joiningDate) - joinTimestamp(a.joiningDate))
    .slice(0, 6);

  const hiringTrend = hiringTrendFromRoster(roster);
  const joinedThisMonth = joinedWithin(roster, now);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={<Greeting name={user.name} />}
        description={<TodayLabel />}
        actions={<AdminQuickActions />}
      />

      {stats ? (
        <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 min-[1100px]:grid-cols-4">
          <KpiCard
            index={0}
            href="/directory"
            label="Total employees"
            value={stats.totalEmployees}
            icon={Users}
            tone={CHART_PALETTE[0]}
            trend={monthlyHeadcount(roster, now)}
            hint={
              joinedThisMonth > 0
                ? `+${joinedThisMonth} joined in the last 30 days`
                : "No new joiners in the last 30 days"
            }
          />
          <KpiCard
            index={1}
            href="/directory?status=active"
            label="Active"
            value={stats.activeEmployees}
            icon={UserCheck}
            tone={CHART_PALETTE[1]}
            hint={`${percent(stats.activeEmployees, stats.totalEmployees)}% of the organization`}
          />
          <KpiCard
            index={2}
            href="/directory?status=terminated"
            label="Inactive"
            value={stats.inactiveEmployees}
            icon={UserX}
            tone={CHART_PALETTE[2]}
            hint="Terminated records"
          />
          <KpiCard
            index={3}
            href="/directory"
            label="Departments"
            value={stats.departmentCounts.filter((d) => d.count > 0).length}
            icon={Building2}
            tone={CHART_PALETTE[3]}
            hint="With at least one person"
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-[13px] text-muted-foreground">
            Could not load dashboard stats. Try again shortly.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Hiring trend</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <HiringTrendChart data={hiringTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent hires</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {recentlyJoined.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">No employees yet.</p>
            ) : (
              recentlyJoined.map((employee) => (
                <Link
                  key={employee._id}
                  href={`/directory?action=view&employeeId=${employee._id}`}
                  className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
                >
                  <Avatar className="size-8">
                    <AvatarFallback colorKey={employee.name}>{initials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-medium">{employee.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{employee.designation}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(employee.joiningDate)}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Headcount by department</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {stats.departmentCounts.map((d, i) => (
                <div key={d.department} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span>{d.department}</span>
                    <span className="font-medium tabular-nums">{d.count}</span>
                  </div>
                  <Progress
                    value={percent(d.count, stats.totalEmployees)}
                    indicatorClassName={CHART_PALETTE[i % CHART_PALETTE.length].indicator}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employee status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusDonutChart active={stats.activeEmployees} inactive={stats.inactiveEmployees} />
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
