import { Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@WorkSphere/ui/components/avatar";
import { Badge } from "@WorkSphere/ui/components/badge";
import { Button } from "@WorkSphere/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@WorkSphere/ui/components/card";

import { StatusPill } from "@/components/employee/status-pill";
import { ROLE_LABELS } from "@/lib/enums";
import { getEmployeeById, getEmployeeName, getReportees } from "@/lib/employees";
import { formatDate, initials } from "@/lib/format";
import { editableFieldsFor } from "@/lib/permissions";
import { getMe } from "@/lib/session";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [user, { id }] = await Promise.all([getMe(), params]);

  if (!user) {
    redirect("/login");
  }

  const { employee, status } = await getEmployeeById(id);

  if (!employee) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold tracking-tight">Employee Profile</h1>
        <Card>
          <CardContent className="py-6 text-xs text-muted-foreground">
            {status === 403 ? "You don't have access to this profile." : "Employee not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const [managerName, reportees] = await Promise.all([
    employee.reportingManager ? getEmployeeName(employee.reportingManager) : null,
    getReportees(id),
  ]);

  const canEdit = editableFieldsFor(user, employee).length > 0;
  const isOwnProfile = user.id === id;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-4 min-[860px]:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
              <Avatar className="size-20">
                {employee.profileImage ? (
                  <AvatarImage src={employee.profileImage} alt="" />
                ) : null}
                <AvatarFallback className="text-lg">{initials(employee.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold">{employee.name}</span>
              <span className="text-xs text-muted-foreground">{employee.designation}</span>
              {employee.employeeId ? (
                <span className="text-xs text-muted-foreground">{employee.employeeId}</span>
              ) : null}
              <Badge variant="secondary">{ROLE_LABELS[employee.role]}</Badge>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {canEdit ? (
              <Button
                render={<Link href={`/employees/${id}/edit`} />}
                nativeButton={false}
                className="w-full"
              >
                Edit Profile
              </Button>
            ) : null}
            {isOwnProfile ? (
              <Button
                render={<Link href="/change-password" />}
                nativeButton={false}
                variant="outline"
                className="w-full"
              >
                Change Password
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2">
            <Field label="Email" value={employee.email} />
            <Field label="Phone" value={employee.phone} />
            <Field label="Department" value={employee.department} />
            <Field label="Designation" value={employee.designation} />
            <Field
              label="Salary"
              value={
                employee.salary !== undefined ? (
                  `$${employee.salary.toLocaleString()}`
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="size-3" /> Hidden
                  </span>
                )
              }
            />
            <Field label="Joining Date" value={formatDate(employee.joiningDate)} />
            <Field label="Status" value={<StatusPill status={employee.status} />} />
            <Field
              label="Reporting Manager"
              value={
                employee.reportingManager
                  ? (managerName ?? "Assigned (name unavailable)")
                  : "No manager"
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">Direct Reports</h2>
        {reportees.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-xs text-muted-foreground">
              No direct reports.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 min-[640px]:grid-cols-3 min-[960px]:grid-cols-4">
            {reportees.map((report) => (
              <Link key={report._id} href={`/employees/${report._id}`}>
                <Card>
                  <CardContent className="flex items-center gap-2 py-3">
                    <Avatar className="size-8 shrink-0">
                      {report.profileImage ? (
                        <AvatarImage src={report.profileImage} alt="" />
                      ) : null}
                      <AvatarFallback>{initials(report.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-xs font-medium">{report.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {report.designation}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
