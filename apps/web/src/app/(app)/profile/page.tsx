import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@WorkSphere/ui/components/avatar";
import { Badge } from "@WorkSphere/ui/components/badge";
import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { StatusPill } from "@/components/employee/status-pill";
import { getEmployeeById, getEmployeeName } from "@/lib/employees";
import { formatDate, initials } from "@/lib/format";
import { editableFieldsFor } from "@/lib/permissions";
import { getMe } from "@/lib/session";

import { ProfileEditableFields } from "./profile-editable-fields";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function ProfilePage() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  const { employee } = await getEmployeeById(user.id);

  if (!employee) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-6 text-xs text-muted-foreground">
            Could not load your profile. Try again shortly.
          </CardContent>
        </Card>
      </div>
    );
  }

  const managerName = employee.reportingManager
    ? await getEmployeeName(employee.reportingManager)
    : null;
  const editableFields = editableFieldsFor(user, employee);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card className="overflow-hidden pt-0">
        <div className="h-20 bg-gradient-to-r from-primary/60 to-primary" />
        <CardContent className="flex flex-col items-center gap-3 pt-0 text-center min-[600px]:flex-row min-[600px]:items-end min-[600px]:gap-4 min-[600px]:text-left">
          <Avatar className="-mt-10 size-20 border-4 border-card">
            {employee.profileImage ? <AvatarImage src={employee.profileImage} alt="" /> : null}
            <AvatarFallback className="text-lg" colorKey={employee.name}>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-sm font-semibold">{employee.name}</span>
            <span className="text-xs text-muted-foreground">
              {employee.designation} · {employee.department}
            </span>
          </div>
          <StatusPill status={employee.status} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-6 py-4">
          <ProfileEditableFields employee={employee} editableFields={editableFields} />

          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Company Details
              </span>
              <Badge variant="outline">Read-only</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 min-[860px]:grid-cols-3">
              <Field label="Employee ID" value={employee.employeeId || "—"} />
              <Field label="Department" value={employee.department} />
              <Field label="Designation" value={employee.designation} />
              <Field
                label="Reporting Manager"
                value={
                  employee.reportingManager
                    ? (managerName ?? "Assigned (name unavailable)")
                    : "No manager"
                }
              />
              <Field label="Joining Date" value={formatDate(employee.joiningDate)} />
              <Field
                label="Salary"
                value={
                  employee.salary !== undefined ? `$${employee.salary.toLocaleString()}` : "Hidden"
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
