import { redirect } from "next/navigation";

import { Card, CardContent } from "@WorkSphere/ui/components/card";

import { employeeRoles } from "@/lib/enums";
import { getEmployeeById, getEmployeeName, getEmployeeRoster } from "@/lib/employees";
import {
  canAssignSuperAdmin,
  canEditEmployee,
  canReassignManager as canReassignManagerFor,
  editableFieldsFor,
} from "@/lib/permissions";
import { getMe } from "@/lib/session";

import { EmployeeForm } from "../../employee-form";

export default async function EditEmployeePage({
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
        <h1 className="text-xl font-semibold tracking-tight">Edit Employee</h1>
        <Card>
          <CardContent className="py-6 text-xs text-muted-foreground">
            {status === 403 ? "You don't have access to edit this record." : "Employee not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Covers both "not this viewer's record" and hr_manager-editing-a-super_admin
  // — same rule, single source of truth. Bounce to the read-only profile
  // instead of a dead end, same redirect-away pattern as Part 1.
  if (!canEditEmployee(user, employee)) {
    redirect(`/employees/${id}`);
  }

  const editableFields = editableFieldsFor(user, employee);
  const canEditRole = user.role !== "employee";
  const canReassignManager = canReassignManagerFor(user);
  const roleOptions = employeeRoles.filter((r) => r !== "super_admin" || canAssignSuperAdmin(user));

  const [roster, managerName] = await Promise.all([
    canReassignManager ? getEmployeeRoster() : Promise.resolve([]),
    employee.reportingManager ? getEmployeeName(employee.reportingManager) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold tracking-tight">Edit Employee</h1>
      <EmployeeForm
        mode="edit"
        employee={employee}
        editableFields={editableFields}
        canEditRole={canEditRole}
        roleOptions={roleOptions}
        canReassignManager={canReassignManager}
        managerRoster={roster}
        managerName={managerName}
      />
    </div>
  );
}
