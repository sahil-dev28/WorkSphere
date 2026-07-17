import type { LucideIcon } from "lucide-react";
import { Building2, UserCheck, Users, UserX } from "lucide-react";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@WorkSphere/ui/components/card";
import { Progress } from "@WorkSphere/ui/components/progress";

import { serverFetch } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import type { Me } from "@/lib/session";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  departmentCounts: { department: string; count: number }[];
}

interface EmployeeListItem {
  _id: string;
  name: string;
  designation: string;
  joiningDate: string;
}

async function getStats(): Promise<DashboardStats> {
  const res = await serverFetch("/api/dashboard/stats");
  const body = (await res.json()) as { data: DashboardStats };
  return body.data;
}

// Records from before joiningDate existed have no value for it at all —
// treat that as "oldest", not as an invalid-date sort glitch that could
// surface them as most-recent.
function joinTimestamp(date: string): number {
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? -Infinity : time;
}

// No dedicated "recently joined" endpoint — reuse the list endpoint and sort
// server-side here rather than add one.
async function getRecentlyJoined(): Promise<EmployeeListItem[]> {
  const res = await serverFetch("/api/employees");
  const body = (await res.json()) as { data: EmployeeListItem[] };

  return [...body.data]
    .sort((a, b) => joinTimestamp(b.joiningDate) - joinTimestamp(a.joiningDate))
    .slice(0, 5);
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 py-2">
        <Icon className="size-5 text-muted-foreground" />
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

export async function AdminDashboard({ user }: { user: Me }) {
  const [stats, recentlyJoined] = await Promise.all([getStats(), getRecentlyJoined()]);

  // "Department Count" = departments that currently have someone in them,
  // not the enum's fixed size of 7 — a static 7 never changes with the data
  // and isn't really a stat.
  const activeDepartmentCount = stats.departmentCounts.filter((d) => d.count > 0).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold tracking-tight">Welcome back, {user.name}</h1>

      <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-4">
        <StatCard icon={Users} value={stats.totalEmployees} label="Total Employees" />
        <StatCard icon={UserCheck} value={stats.activeEmployees} label="Active Employees" />
        <StatCard icon={UserX} value={stats.inactiveEmployees} label="Inactive Employees" />
        <StatCard icon={Building2} value={activeDepartmentCount} label="Department Count" />
      </div>

      <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.departmentCounts.map((d) => (
              <div key={d.department} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span>{d.department}</span>
                  <span className="font-medium tabular-nums">{d.count}</span>
                </div>
                <Progress
                  value={stats.totalEmployees > 0 ? (d.count / stats.totalEmployees) * 100 : 0}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Joined</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentlyJoined.length === 0 ? (
              <p className="text-xs text-muted-foreground">No employees yet.</p>
            ) : (
              recentlyJoined.map((employee) => (
                <div key={employee._id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials(employee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-xs font-medium">{employee.name}</span>
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
