// Mirrors apps/server/src/utils/constants.ts. No shared package between the
// two apps for this, so these stay manually in sync with the backend.
export const departments = [
  "Engineering",
  "Design",
  "Product",
  "Sales",
  "Marketing",
  "HR",
  "Finance",
] as const;

export const employeeRoles = ["super_admin", "hr_manager", "employee"] as const;

export const employeeStatuses = ["active", "on_leave", "terminated"] as const;

export const ROLE_LABELS: Record<(typeof employeeRoles)[number], string> = {
  super_admin: "Super Admin",
  hr_manager: "HR Manager",
  employee: "Employee",
};

export const STATUS_LABELS: Record<(typeof employeeStatuses)[number], string> = {
  active: "Active",
  on_leave: "On Leave",
  terminated: "Terminated",
};
