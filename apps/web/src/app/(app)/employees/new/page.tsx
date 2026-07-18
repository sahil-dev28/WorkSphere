import { redirect } from "next/navigation";

import { employeeRoles } from "@/lib/enums";
import { getEmployeeRoster } from "@/lib/employees";
import { canAssignSuperAdmin, canCreateEmployee } from "@/lib/permissions";
import { getMe } from "@/lib/session";

import { EmployeeForm } from "../employee-form";

export default async function NewEmployeePage() {
  const user = await getMe();

  if (!user) {
    redirect("/login");
  }

  // Only super_admin/hr_manager can POST /api/employees — an employee has no
  // reason to ever land here, so bounce before rendering anything.
  if (!canCreateEmployee(user)) {
    redirect("/dashboard");
  }

  const roster = await getEmployeeRoster();
  const roleOptions = employeeRoles.filter((r) => r !== "super_admin" || canAssignSuperAdmin(user));

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold tracking-tight">Add Employee</h1>
      <EmployeeForm
        mode="create"
        editableFields={["name", "email", "phone", "department", "designation", "salary", "joiningDate", "status", "role", "profileImage"]}
        canEditRole
        roleOptions={roleOptions}
        canReassignManager
        managerRoster={roster}
        managerName={null}
      />
    </div>
  );
}
