import { redirect } from "next/navigation";

import { Avatar, AvatarFallback } from "@WorkSphere/ui/components/avatar";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { EmployeeDialog } from "@/app/(app)/directory/employee-dialog";
import { SESSION_EXPIRED_PATH } from "@/lib/constants";
import { employeeRoles } from "@/lib/enums";
import { serverFetch } from "@/lib/api";
import { getEmployeeRoster } from "@/lib/employees";
import { initials } from "@/lib/format";
import { getMe } from "@/lib/session";
import type { Employee } from "@/lib/types";

import { OrgChartCanvas, type OrgChartDatum } from "./org-chart-canvas";

interface DashboardStats {
  totalEmployees: number;
  departmentCounts: { department: string; count: number }[];
}

const DEPARTMENT_COLORS: Record<Employee["department"], string> = {
  Engineering: "var(--chart-1)",
  Design: "var(--chart-2)",
  Product: "var(--chart-3)",
  Sales: "var(--chart-4)",
  Marketing: "var(--chart-5)",
  HR: "var(--primary)",
  Finance: "var(--destructive)",
};

async function getStats(): Promise<DashboardStats | null> {
  const res = await serverFetch("/api/dashboard/stats");

  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as { data: DashboardStats };
  return body.data;
}

export default async function OrgChartPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; employeeId?: string }>;
}) {
  const [user, params] = await Promise.all([getMe(), searchParams]);

  if (!user) {
    redirect(SESSION_EXPIRED_PATH);
  }

  if (user.role === "employee") {
    redirect("/dashboard");
  }

  const [employees, stats] = await Promise.all([
    getEmployeeRoster(),
    getStats(),
  ]);

  if (employees.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Card>
          <CardContent className="py-6 text-center text-xs text-muted-foreground">
            No employees in the organization yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  const root = employees.find((e) => e.role === "super_admin") ?? employees[0]!;
  const departmentCount =
    stats?.departmentCounts.filter((d) => d.count > 0).length ?? 0;

  const employeeIds = new Set(employees.map((e) => e._id));
  const validParentId = (id: string | null) =>
    id && employeeIds.has(id) && id !== root._id ? id : root._id;

  const directReportCounts = new Map<string, number>();
  for (const e of employees) {
    if (e._id === root._id) continue;
    const parentId = validParentId(e.reportingManager);
    directReportCounts.set(
      parentId,
      (directReportCounts.get(parentId) ?? 0) + 1,
    );
  }

  const chartData: OrgChartDatum[] = employees.map((e) => ({
    id: e._id,
    parentId: e._id === root._id ? null : validParentId(e.reportingManager),
    name: e.name,
    designation: e.designation,
    department: e.department,
    departmentColor: DEPARTMENT_COLORS[e.department],
    directReports: directReportCounts.get(e._id) ?? 0,
  }));

  const dialogEmployee =
    params.action === "view" && params.employeeId
      ? employees.find((e) => e._id === params.employeeId)
      : undefined;

  const managerNames = new Map(employees.map((e) => [e._id, e.name]));

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-between gap-4 py-4 min-[600px]:flex-row">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="text-sm" colorKey={root.name}>
                {initials(root.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{root.name}</span>
              <span className="text-xs text-muted-foreground">
                {root.designation}
              </span>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold tabular-nums">
                {stats?.totalEmployees ?? employees.length}
              </span>
              <span className="text-xs text-muted-foreground">Employees</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold tabular-nums">
                {departmentCount}
              </span>
              <span className="text-xs text-muted-foreground">Departments</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden p-0">
        <OrgChartCanvas data={chartData} />
      </Card>

      {dialogEmployee ? (
        <EmployeeDialog
          mode="view"
          employee={dialogEmployee}
          editableFields={[]}
          canEditRole={false}
          roleOptions={[...employeeRoles]}
          canReassignManager={false}
          managerRoster={[]}
          managerName={
            dialogEmployee.reportingManager
              ? (managerNames.get(dialogEmployee.reportingManager) ?? null)
              : null
          }
        />
      ) : null}
    </div>
  );
}
